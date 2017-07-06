import { deepCopy, convertEmptyStringToNull } from '../../utils';
import * as utils from './utils';

const DEFAULT_HEADER = 'H';

/*
action = {
	name: new experiment name
}
*/
export function setName(state, action) {
	let node = state[state.previewId];
	if (!node) return state;

	let new_state = Object.assign({}, state);
	node = deepCopy(node);
	new_state[node.id] = node;

	node.name = action.name;

	return new_state;
}

/*
action = {
	key: name of param,
	value: new value
}
*/
export function setPluginParam(state, action) {
	let { key, value } = action;

	let new_state = Object.assign({}, state);
	let node = deepCopy(new_state[new_state.previewId]);
	new_state[node.id] = node;
	node.parameters[key] = value;

	return new_state;
}


export function changePlugin(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);


	let params = window.jsPsych.plugins[action.newPluginVal].info.parameters;
	let paramKeys = Object.keys(params);

	var paramsObject = { type: action.newPluginVal };

	for(let i=0; i<paramKeys.length; i++) {
		paramsObject[paramKeys[i]] = convertEmptyStringToNull(params[paramKeys[i]].default);
	}

	node = deepCopy(node);

	node.parameters = paramsObject;
	new_state[state.previewId] = node;

	return new_state;
}

export function changeToggleValue(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);

	node.parameters[action.paramId] = action.newVal;
	new_state[state.previewId] = node;

	return new_state;
}

export function choicesHelper(string) {
	let array = [];

 	//turns string into array
	for(let i=0; i<string.length; i++) {
		array.push(string[i]);
	}

	return array;
}

export function getCurlyIndex(string) {
	let array = [];

	for(let i=0; i<string.length; i++) {
		if(string[i] === '{') {
			array.push(i);
		}
	}
	console.log(array);
	return array;
}

export function changeChoices(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);
	let str,
		index,
		results = [],
		re = /{([^}]+)}/g, text;

	node = deepCopy(node);
	new_state[state.previewId] = node;

	index = getCurlyIndex(action.newVal); //Index to put {...}

	str = (action.newVal).replace(/{([^}]+)}/g, "");
	console.log(str);

	while(text = re.exec(action.newVal)) {
    	results.push(text[0]);
  	}

  	node.parameters[action.paramId] = choicesHelper(str);

  	for(let i=0; i<index.length; i++) {
  		node.parameters[action.paramId].splice(index[i], 0, results[i]);
  	}

	console.log(node);

	return new_state;
}

export function changeCheck(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);
	new_state[state.previewId] = node;

	if(action.newVal == false) {
		node.parameters[action.paramId] = null;
	} else {
		node.parameters[action.paramId] = ['allkeys'];
	}
	console.log(node);
	return new_state;
}

export function changeParamText(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);
	new_state[state.previewId] = node;

	node.parameters[action.paramId] = action.newVal;

	return new_state;
}

export function changeParamInt(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);
	new_state[state.previewId] = node;

	node.parameters[action.paramId] = action.newVal;

	return new_state;
}

export function changeParamFloat(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);
	new_state[state.previewId] = node;

	node.parameters[action.paramId] = action.newVal;

	return new_state;
}


export function changeHeader(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);
	new_state[state.previewId] = node;

	let newArray = utils.arrayOfArrays(node.parameters.timeline_variables);
	let headerArray = newArray[0];
	headerArray[action.headerId] = action.newVal;
	node.parameters.timeline_variables = utils.arrayOfObjects(newArray)

	return new_state;
}

export function changeCell(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);
	new_state[state.previewId] = node;

	let  cellString = action.cellId; //string with row and column index
 	let  cellIndex = cellString.split(' ');
	let newArray = utils.arrayOfArrays(node.parameters.timeline_variables);
	let cellRow = cellIndex[0];
    let  cellColumn = cellIndex[1];

    newArray[cellRow][cellColumn] = action.newVal;

    node.parameters.timeline_variables = utils.arrayOfObjects(newArray);
    return new_state;

}

export function addColumnHelper(array) {
	for(let i=1; i<array.length; i++) {
		array[i][array[0].length-1] = undefined;
	}
	return array;
}

var index = 1;
export function addColumn(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);

	let newArray = utils.arrayOfArrays(node.parameters.timeline_variables);
	newArray[0].push(DEFAULT_HEADER + '' + index++);
	addColumnHelper(newArray);
	node.parameters.timeline_variables = utils.arrayOfObjects(newArray);

	new_state[state.previewId] = node;
	return new_state;
}

export function addRowHelper(array) {
	array.push([]);
	for(let i=0; i<array[0].length; i++) {
		array[array.length-1][i] = undefined;
	}
	return array;
}

export function addRow(state, action) {
	let node = state[state.previewId];
	console.log("in add row");
	console.log(node);
	let new_state = Object.assign({}, state);

	node = deepCopy(node);

	let newArray = utils.arrayOfArrays(node.parameters.timeline_variables);
	addRowHelper(newArray);
	node.parameters.timeline_variables = utils.arrayOfObjects(newArray);

	new_state[state.previewId] = node;
	return new_state;
}

export function deleteColumn(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);

    let newArray = utils.arrayOfArrays(node.parameters.timeline_variables);

    if(typeof newArray[0][1] !== 'undefined') {
    	let transformColumns = utils.arrayOfColumns(newArray);
    	transformColumns.splice(action.titleIndex,1);

    	node.parameters.timeline_variables = utils.backToArrayOfArrays(transformColumns);
    	node.parameters.timeline_variables = utils.arrayOfObjects(node.parameters.timeline_variables);
    }
    new_state[state.previewId] = node;
	return new_state;
}

export function deleteRow(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);

    let newArray = utils.arrayOfArrays(node.parameters.timeline_variables);

    if(typeof newArray[2] !== 'undefined') {
     	newArray.splice(action.rowIndex, 1);
    	node.parameters.timeline_variables = utils.arrayOfObjects(newArray);
    }
 	new_state[state.previewId] = node;
	return new_state;
}

export function deleteColumnHeader(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);
    let newArray = utils.arrayOfArrays(node.parameters.timeline_variables);

   	if(typeof newArray[0][1] !== 'undefined') {
    	let transformColumns = utils.arrayOfColumns(newArray);
    	transformColumns.splice(action.titleIndex,1);

    	node.parameters.timeline_variables = utils.backToArrayOfArrays(transformColumns);
    	node.parameters.timeline_variables = utils.arrayOfObjects(node.parameters.timeline_variables);
    }
    new_state[state.previewId] = node;
	return new_state;
}

export function changeSampling(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);

	node.parameters.sampling['type'] = action.newVal;

	new_state[state.previewId] = node;
	return new_state;
}

export function changeSize(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);

	node.parameters.sampling['size'] = action.newVal;

	new_state[state.previewId] = node;
	return new_state;
}

export function changeRandomize(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);

	node.parameters.randomize_order = action.newBool;

	new_state[state.previewId] = node;
	return new_state;
}

export function changeReps(state, action) {
	let node = state[state.previewId];
	let new_state = Object.assign({}, state);

	node = deepCopy(node);

	node.parameters.repetitions = action.newVal;

	new_state[state.previewId] = node;
	return new_state;
}
