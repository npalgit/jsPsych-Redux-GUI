import Prefixer from 'inline-style-prefixer';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
var short = require('short-uuid');
const _prefixer = new Prefixer()

export const prefixer = (style={}, multiple=false) => {
	if (!multiple) return _prefixer.prefix(style);
	let res = {};
	for (let key of Object.keys(style)) {
		res[key] = _prefixer.prefix(style[key]);
	}
	return res;
}

if (!Array.prototype.move) {
  Array.prototype.move = function(from,to){
    this.splice(to,0,this.splice(from,1)[0]);
    return this;
  };
}

/*
Simple utils.deepCopy,
Target can be
object
boolean
number
array
undefined

*/
export function deepCopy(target) {
	if (!target) return target;

	let clone = target;

	let type = typeof(target);
	switch(type) {
		case "boolean":
		case "number":
		case "string":
			return clone;
		case "object":
			if (Array.isArray(clone)) {
				clone = [];
				for (let item of target) {
					clone.push(deepCopy(item));
				}
			} else {
				clone = {};
				let keys = Object.keys(target);
				for (let key of keys) {
					clone[key] = deepCopy(target[key]);
				}
			}
			return clone;
		case 'function':
			return clone;
		default:
			throw new TypeError(type + " not supported.");
	}
}

export const toNull = (s) => ((s === '') ? null : s);

export const toEmptyString = (s) => ((s === null) ? '' : s);

export const toEmptyArray = (s) => (!s ? [] : s);

export function getUUID() {
	var translator = short();
	//var decimalTranslator = short("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
	let res = translator.new();
	return res;
}

export function isValueEmpty(val) {
	return val === '' || val === null || val === undefined || (Array.isArray(val) && val.length === 0) ||
			(typeof val === 'object' && Object.keys(val).length === 0);
}

export function injectJsPsychUniversalPluginParameters(obj={}) {
	return Object.assign(obj, window.jsPsych.plugins.universalPluginParameters);
}

export const withDnDContext = DragDropContext(HTML5Backend);