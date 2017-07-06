export default function(preloadedState) {
	return `
	<!doctype html>
	<html lang="en">
	  <head>
	    <meta charset="utf-8">
	    <meta name="viewport" content="width=device-width, initial-scale=1">
	    <title>jsPsych Experiment Builder</title>
	    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
	    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
	    <link href="https://fonts.googleapis.com/css?family=Roboto+Mono" rel="stylesheet">
	    <link rel="stylesheet" href="./style.css">
	    <script type="text/javascript" src="jsPsych/jspsych.js"></script>
	    <script type="text/javascript" src="jsPsych/plugins/jspsych-text.js"></script>
	    <script type="text/javascript" src="jsPsych/plugins/jspsych-single-stim.js"></script>
    	<script type="text/javascript" src="jsPsych/plugins/jspsych-image-keyboard-response.js"></script>
    	<script type="text/javascript" src="jsPsych/plugins/jspsych-audio-keyboard-response.js"></script>
	    <link href="jsPsych/css/jspsych.css" rel="stylesheet" type="text/css"></link>
	    <script type="text/javascript" src="http://code.jquery.com/jquery-2.1.3.min.js"></script>
	    <script type="text/javascript" src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
	    <script type="text/javascript" src="./polyfill.js"></script>
	  </head>
	  <body class='canvas'>
	    <div id="container"></div>
	  </body>
	  <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\x3c')}
      </script>
	  <script src="/static/bundle.js"></script>
	</html>
    `
}


