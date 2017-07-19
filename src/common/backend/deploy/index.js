// var esprima = require("esprima");
// var escodegen = require("escodegen");
var JSZip = require('jszip');
var FileSaver = require('filesaver.js-npm');
import { initState as jsPsychInitState, jsPsych_Display_Element } from '../../reducers/Experiment/jsPsychInit';
import { createComposite, ParameterMode } from '../../reducers/Experiment/editor';
import { isTimeline, isTrial } from '../../reducers/Experiment/utils';
import { getSignedUrl, getFiles } from '../s3';

const Deploy_Folder = 'assets';
const DEPLOY_PATH = 'assets/';
const welcomeObj = {
  ...jsPsychInitState,
  timeline: [{
        type: 'html-keyboard-response',
        stimulus: createComposite(''),
        choices: createComposite(null),
        prompt: createComposite('<p>Welcome to jsPysch Experiment Builder!</p>'),
        stimulus_duration: createComposite(null),
        trial_duration: createComposite(null),
        response_ends_trial: createComposite(null),
      }
  ]
}

const undefinedObj = {
  ...jsPsychInitState,
  timeline: [
    {
      type: 'html-keyboard-response',
        stimulus: createComposite(''),
        choices: createComposite(null),
        prompt: createComposite('<p>No trial is defined or selected!</p>'),
        stimulus_duration: createComposite(null),
        trial_duration: createComposite(null),
        response_ends_trial: createComposite(null),
    }
  ]
}


export const MediaPathTag = (filename) => (`<path>${filename}</path>`);

// Code for generating welcome
export const Welcome = 'jsPsych.init(' + stringify(welcomeObj) + ');';

// Code for generating undefined page
export const Undefined = 'jsPsych.init(' + stringify(undefinedObj) + ');';

/*
DIY deploy built experiment for user
It will:
1. Extract deploy information
2. Download used media
3. Generate code, bundle media with index.html as zip

Param
state, whole redux state
progressHook, callback from presentational component that will show user downloading progress
*/
export function diyDeploy(state, progressHook) {
  let experimentState = state.experimentState;
  var zip = new JSZip();

  /* ************ Step 1 ************ */
  // Extract deploy information
  let deployInfo = {
    experimentName: experimentState.experimentName,
    // search for used plugins
    plugins: {},
    // search for used media
    /*
    media = {
      s3-address-of-file: filename
    }
    */
    media: {},
    code: generateCode(experimentState, true, true),
  }
  // Extract used plugins and media
  extractDeployInfomation(experimentState, deployInfo, experimentState.media.Prefix);

  /* ************ Step 2 ************ */
  let filePaths = Object.keys(deployInfo.media);
  let total = 0;
  // Get total size of files that need to be downloaded
  for (let f of experimentState.media.Contents) {
    if (filePaths.indexOf(f.Key) > -1) {
      total += f.Size;
    }
  }
  // initialize progress
  progressHook(filePaths.map((d) => (0)), total);

  /* ************ Step 2 && 3 ************ */
  // generate index.html, append it in zip file
  zip.file("index.html", generatePage(deployInfo));
  // create assets folder
  var assets = zip.folder(Deploy_Folder);

  // download media
  return getFiles(filePaths, (key, data) => {
    assets.file(deployInfo.media[key], data);
  }, (loaded) => {
    progressHook(loaded, total);
  }).then(() => {
    // append media in zip
    zip.generateAsync({
        type: "blob"
      })
      .then(function(blob) {
        FileSaver.saveAs(blob, deployInfo.experimentName + ".zip");
      });
      // functions as Finally 
  }).then(() => {
    // clear progress
    progressHook(null, null, true);
  })
}

/*
Walk through experimentState to extract used media, that is, populate deployInfo.plugin and deployInfo.media  O(n)
It populates deployInfo.media so that it is ready for using s3 getObject API.

media = {
  s3-address-of-file: filename
}

Param:
obj, starts with experimentState
deployInfo, defined above in diyDeploy
prefix, experimentState.media.Prefix
*/

function extractDeployInfomation(obj, deployInfo, prefix) {
  if (!obj) return;
  switch (typeof obj) {
    case 'object':
      if (Array.isArray(obj)) {
        for (let o of obj) extractDeployInfomation(o, deployInfo, prefix);
      } else {
        for (let key of Object.keys(obj)) {
          // if it is a trial, find its plugin type
          if (obj[key] && isTrial(obj[key])) {
            // record used plugin
            deployInfo.plugins[obj[key].parameters.type] = true;
          }
          // recusive call
          extractDeployInfomation(obj[key], deployInfo, prefix);
        }
      }
      break;
    case 'string':
      let matches = obj.match(/<path>(.*?)<\/path>/g);
      if (matches) {
        // populate deployInfo.media
        for (let m of matches) {
          m = m.replace(/<\/?path>/g, '');
          // state.media.Prefix + m is the s3 address
          deployInfo.media[prefix + m] = m;
        }
      }
      break;
    default:
      break;
  }
}


/*
state - experimentState
all - indicates if play all experiments
deploy - indicates if in deploy mode (include all nodes)
*/ 
export function generateCode(state, all=false, deploy=false) {
  // if all experiments are requested, then source is obviously mainTimeline
  // otherwise, only generate code for the currently previewed node
  let timeline = (all) ? state.mainTimeline : [state.previewId];
  let blocks = [];
  let node;
  // bool that descides if this node should be include
  let include;
  for (let id of timeline) {
    if (!id) continue;
    node = state[id];
    // if play all experiments, let node.enable decide if this node is included
    // if in deploy mode, include all nodes
    include = (!all || deploy) ? true : node.enabled;
    if (include) {
      // generate timeline block
      if (isTimeline(node)) {
        if (node.childrenById.length > 0) {
          blocks.push(generateTimelineBlock(state, node, all, deploy));
        }
        // generate trial block
      } else {
        if (node.parameters.type) {
          blocks.push(generateTrialBlock(state, node, all, deploy));
        }
      }
    }
  }

  // if nothing is generated
  if (!blocks.length) {
    return Welcome;
  }

  // finalize jsPsych block
  let obj = {
    ...state.jsPsychInit,
    timeline: blocks
  };

  // if in deploy mode, we want the experiment to take over whole page
  if (deploy) {
    obj["display_element"] = undefined;
  }

  // fetch s3 path, if there is one (if user hasn't logged in or saved anything, state.media is empty)
  let s3Path = (state && state.media) ? state.media.Prefix : "";

  // call jsPsych
  return "jsPsych.init(" + stringify(obj, (deploy) ? DEPLOY_PATH : s3Path) + ");";
}


/*
Resolve path for media that are inserted by typing "<path>filename</path>"

Param
str, path string
filePath, the path of file
*/
function resolveMediaPath(str, prefix) {
  let matches = (str) ? str.match(/<path>(.*?)<\/path>/g) : null;
  let deploy = prefix === DEPLOY_PATH;
  let processFunc = getSignedUrl;
  // in diy deploy mode, we don't get file from S3
  if (deploy) {
    processFunc = p => p;
  }
  if (matches) {
    for (let m of matches) {
      str = str.replace(m, 
        processFunc(prefix + m.replace(/<\/?path>/g, ''))
      );
    }
  }
  return str;
}


/*
Generate jspsych trial block.
For each parameter in trial.parameters, it should be a composite object which
is defined in reducers/editor

export const createComposite = (value=null, func=createFuncObj(), mode=null) => ({
  isComposite: true,
  mode: mode, 
  value: value,
  func: func,
  timelineVariable: null,
})
*/
function generateTrialBlock(state, trial, all=false, deploy=false) {
  let res = {};
  let parameters = trial.parameters;
  for (let key of Object.keys(parameters)) {
    res[key] = parameters[key];
  }
  return res;
}

/*
Generate jsPysch timeline block

*/
function generateTimelineBlock(state, node, all=false, deploy=false) {
  // spread parameters to res
  let res = {
    ...node.parameters
  }
  let timeline = [];
  let desc, include;
  for (let descId of node.childrenById) {
    desc = state[descId];
    // if play all experiments, let node.enable decide if this node is included
    // if in deploy mode, include all nodes
    include = (!all || deploy) ? true : desc.enabled;
    if (include) {
      if (isTimeline(desc)) {
        // if timeline is empty, skip
        if (desc.childrenById.length > 0) {
          // recusive call
          timeline.push(generateTimelineBlock(state, desc, all, deploy));
        } 
      } else {
        if (desc.parameters.type) {
          // generate trial block
          timeline.push(generateTrialBlock(state, desc, all, deploy));
        }
      }
    }
  }

  res.timeline = timeline;
  return res;
}

/*
Generate index.html

deployInfo is defined in function deploy
*/
function generatePage(deployInfo) {
  // Get all plugin <script> tags' strings
  let plugins = Object.keys(deployInfo.plugins).map((name) =>
    (`<script type="text/javascript" src="jsPsych/plugins/jspsych-${name}.js"></script>`)
  )
  let pluginsStr = "";
  for (let p of plugins) {
    pluginsStr += p;
  }

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${deployInfo.experimentName}</title>
      <script type="text/javascript" src="jsPsych/jspsych.js"></script>
      ${pluginsStr}
      <link href="jsPsych/css/jspsych.css" rel="stylesheet" type="text/css"></link>
    </head>
    <body id="${jsPsych_Display_Element}" class="${jsPsych_Display_Element}">
    </body>
    <script>
      ${deployInfo.code}
    </script>
  </html>
`
}

/*
Specially written for stringify obj in this app to generate code
For functions, turn it to
{
  isFunc: true,
  code: function
}

For all trial item, turn it to
{
  isComposite: true,
  value: value,
  mode: string,
  func: func obj
  timelineVariable: string
}

*/
export function stringify(obj, filePath) {
  if (!obj) return JSON.stringify(obj);

  let type = typeof obj;
  switch (type) {
    // if target is object
    case 'object':
      let res = [];
      // if target is array
      if (Array.isArray(obj)) {
        res.push("[");
        let l = obj.length,
          i = 1;
        for (let item of obj) {
          res.push(stringify(item, filePath));
          if (i++ < l) {
            res.push(",");
          }
        }
        res.push("]");
        // if it is supposed to be function, call stringifyFunc
      } else if (obj.isFunc) {
        return stringifyFunc(obj.code, obj.info, filePath);
        // if it is a trial item
      } else if (obj.isComposite) {
        switch(obj.mode) {
          // if user wants to use function mode
          case ParameterMode.USE_FUNC:
            // recusive call stringify to generate code for obj.func
            return stringify(obj.func, filePath);
          // if user wants to use timeline variable 
          case ParameterMode.USE_TV:
            // add jsPsych api call
            return `jsPsych.timelineVariable("${obj.timelineVariable}")`;
          default:
            // recusive call stringify to generate code for obj.value
            return stringify(obj.value, filePath);
        }
      } else {
        // normal object
        res.push("{");
        let keys = Object.keys(obj);
        let l = keys.length,
          i = 1;
        for (let key of keys) {
          res.push('"' + key + '":' + stringify(obj[key], filePath));
          if (i++ < l) {
            res.push(",");
          }
        }
        res.push("}");
      }
      return res.join("");
    default:
      // resolve path for all normal values
      return resolveMediaPath(JSON.stringify(obj), filePath);
  }
}

/*
This function [uses esprima to parse function code and] resolve
media path for all files wrapped in this tag <path></path>

*/
function stringifyFunc(code, info = null, filePath) {
  let func = code;
  // try {
  //   let tree = esprima.parse(code);
  //   func = escodegen.generate(tree, {
  //     format: {
  //       compact: true,
  //       semicolons: true,
  //       parentheses: false
  //     }
  //   });
  // } catch (e) {
  //   console.log("Fail to parse inserted code !");
  // }

  return resolveMediaPath(func, filePath);
}