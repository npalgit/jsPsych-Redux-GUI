import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import TextField from 'material-ui/TextField';
import FloatingActionButton from 'material-ui/FloatingActionButton';

import ContentAdd from 'material-ui/svg-icons/content/add';
import ObjectEditorIcon from 'material-ui/svg-icons/editor/mode-edit';
import Clear from 'material-ui/svg-icons/content/delete-sweep';
import CopyIcon from 'material-ui/svg-icons/content/content-copy';
import PasteIcon from 'material-ui/svg-icons/content/content-paste';
import {
  cyan500 as hoverColor,
  grey100 as toolbarColor,
  pink500 as clearColor,
  blue500 as fixedTextColor,
  // grey50 as listBackgroundColor
} from 'material-ui/styles/colors';

import { renderDialogTitle } from '../gadgets';
import copy from 'copy-to-clipboard';
import { ParameterMode, createComplexDataObject } from '../../reducers/Experiment/editor';
import TimelineVariableSelector from '../../containers/TimelineNodeEditor/TrialForm/TimelineVariableSelectorContainer';
import { stringify } from '../../backend/deploy';
import GeneralTheme from '../theme.js';

const colors = {
	...GeneralTheme.colors
};

const style = {
	TriggerStyle: GeneralTheme.Icon,

}

// const fixedTextColor = 'rgba(0, 0, 0, 0.3)';

const ObjectKeyErrorCode = {
	Good: 0,
	ContainsDuplicate: 1,
}

const jsPysch_Builder_Object_Storage = "jsPsych_builder_object_clipboard";

const copyToLocalStorage = (objStr) => {
	window.localStorage.setItem(jsPysch_Builder_Object_Storage, objStr);
}

const pasteFromLocalStorage = () => {
	return window.localStorage[jsPysch_Builder_Object_Storage];
}

const convertToNull = (s) => {
	if (s === "" || s === undefined) return null;
	return s;
}

const ObjectKeyErrorMessage = (code) => {
	switch(code) {
		case ObjectKeyErrorCode.Good:
			return "";
		case ObjectKeyErrorCode.ContainsDuplicate:
		default:
			return "Key name should be unique.";
	}
}

const convertReserved = (s) => {
	let floatRegex = /^-?\d+\.?\d*$/;
	let intRegex = /^-?\d+$/;
	switch(s) {
		case "true":
			return true;
		case "false":
			return false;
		case "null":
			return null;
		case "undefined":
			return undefined;
		default:
			if (intRegex.test(s)) {
				return parseInt(s, 10);
			} else if (floatRegex.test(s)) {
				return parseFloat(s);
			} else {
				return s;
			}
	}
}

const ValueTextColor = (value) => {
	switch(typeof value) {
		case 'string':
			return 'green';
		case 'number':
			return 'black';
		default:
			return 'blue';
	}
}

class ObjectKey extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			edit: false,
		}

		this.enterEditMode = () => {
			this.setState({
				edit: true
			});
		}

		this.exitEditMode = () => {
			if (this.props.errorCode !== ObjectKeyErrorCode.Good) return;
			this.setState({
				edit: false
			});
		}
	}

	static defaultProps = {
		oldKey: "",
		setObjectKey: () => {},
		errorCode: ObjectKeyErrorCode.Good,
	}
	
	render() {
		let { oldKey, errorCode } = this.props;
		return (
			(this.state.edit) ? 
				<TextField  id={oldKey}
							value={oldKey}
							onBlur={this.exitEditMode}
							errorText={ObjectKeyErrorMessage(errorCode)}
							onKeyPress={(e) => {
								if (e.which === 13) {
									document.activeElement.blur();
								} 
							}}
							onChange={(e, v) => { this.props.setObjectKey(v); }}
							style={{minWidth: 200, maxWidth: 200}}
							underlineFocusStyle={{borderColor: colors.secondary}}
							/>:
				<MenuItem onClick={this.enterEditMode} primaryText={`"${oldKey}"`}/>
			)
	}
}

class ObjectValue extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			edit: false,
		}

		this.enterEditMode = () => {
			this.setState({
				edit: true
			});
		}

		this.exitEditMode = () => {
			this.setState({
				edit: false
			});
		}

		this.processNot = (s) => {
			if (s === null) return "null";
			if (s === undefined) return "undefined";
			return s;
		}
	}

	static defaultProps = {
		value: "",
		setObjectValue: () => {},
		keyName: "",
		index: 0,
	}

	render() {
		let { keyName, complexDataObject, index } = this.props;

		let value = complexDataObject.value;
		let textFieldValue = this.processNot(value);
		let displayValue = (typeof value === 'string') ?
		 `"${value}"` : 
		 (value !== null && value !== undefined) ? JSON.stringify(value) : textFieldValue;

		return (
			(complexDataObject.mode === ParameterMode.USE_TV) ? 
			<MenuItem 
				style={{minWidth: 200, maxWidth: 200, textAlign: 'center'}}
				primaryText={
					<p 
						className='truncate-long-string' 
						title={`Timeline variable: ${complexDataObject.timelineVariable}`}
					>
						{`[Timeline variable]`}
					</p>
				}
				disabled={true} 
				/> :
			(this.state.edit) ? 
				<TextField  id={`${keyName}-${value}-${index}`}
							value={textFieldValue}
							onBlur={this.exitEditMode}
							onKeyPress={(e) => {
								if (e.which === 13) {
									document.activeElement.blur();
								} 
							}}
							onChange={(e, v) => { this.props.setObjectValue(v); }}
							inputStyle={{color: ValueTextColor(value)}}
							style={{minWidth: 200, maxWidth: 200}}
							underlineFocusStyle={{borderColor: colors.secondary}}
							/>:
				<MenuItem 
					onClick={this.enterEditMode} 
					primaryText={
						<p 
							className='truncate-long-string'
							title={displayValue}
						>
						{displayValue}
						</p>
					}
					style={{minWidth: 200, maxWidth: 200, color: ValueTextColor(value), textAlign: 'center'}}
				/>
			)
	}
}

export default class ObjectEditor extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false,
			objectKeys: [],
			objectValues: [],
			objectKeyErrors: [],
			valid: true,
		}

		this.unzip = (value) => {
			let objectKeys = Object.keys(value);
			let objectValues = objectKeys.map((key) => (value[key]));
			this.setState({
				objectKeys: objectKeys,
				objectValues: objectValues,
				objectKeyErrors: objectKeys.map(k => ObjectKeyErrorCode.Good),
			})
		}

		this.handleOpen = () => {
			this.unzip(this.props.value);
			this.setState({
				open: true
			});
		}

		this.handleClose = () => {
			this.setState({
				open: false,
			});
		}


		/*
		param:
		oldKey, old key value
		newKey, new key value,
		i, position of key to be modified
		*/
		this.setObjectKey = (oldKey, newKey, i) => {
			let newObjectKeys = this.state.objectKeys.slice();
			let newObjectKeyErrors = this.state.objectKeyErrors.slice();
			newObjectKeys[i] = newKey;

			// check for duplicate
			let hist = {};
			for (let i = 0; i < newObjectKeys.length; i++) {
				let key = newObjectKeys[i];
				if (!hist[key]) {
					hist[key] = [i];
				} else {
					hist[key].push(i);
				}
			}
			let valid = true;
			// set error message
			for (let v of Object.values(hist)) {
				// if duplicate happens
				if (v.length > 1) {
					for (let i of v) {
						newObjectKeyErrors[i] = ObjectKeyErrorCode.ContainsDuplicate;
					}
					valid = false;
					// else this key is good
				} else {
					newObjectKeyErrors[v[0]] = ObjectKeyErrorCode.Good;
				}
			}

			this.setState({
				objectKeys: newObjectKeys,
				objectKeyErrors: newObjectKeyErrors,
				valid: valid
			});
		}

		this.setObjectValue = (value, i) => {
			let newObjectValues = this.state.objectValues.slice();
			newObjectValues[i].value = convertReserved(value);
			this.setState({
				objectValues: newObjectValues
			})
		}

		this.setObjectValueMode = (i) => {
			let newObjectValues = this.state.objectValues.slice();
			newObjectValues[i].mode = newObjectValues[i].mode === ParameterMode.USE_TV ? null : ParameterMode.USE_TV;
			this.setState({
				objectValues: newObjectValues
			})
		}

		this.setObjectTimelineVariable = (v, i) => {
			let newObjectValues = this.state.objectValues.slice();
			newObjectValues[i].timelineVariable = v;
			newObjectValues[i].mode = ParameterMode.USE_TV;
			this.setState({
				objectValues: newObjectValues
			})
		}

		this.deleteKeyPair = (i) => {
			let newObjectKeys = this.state.objectKeys.slice();
			let newObjectValues = this.state.objectValues.slice();
			let newObjectKeyErrors = this.state.objectKeyErrors.slice();
			newObjectKeys.splice(i, 1);
			newObjectValues.splice(i, 1);
			newObjectKeyErrors.splice(i, 1);

			// update if object now is valid
			let valid = true;
			for (let e of newObjectKeyErrors) {
				if (e !== ObjectKeyErrorCode.Good) {
					valid = false;
					break;
				}
			}
			this.setState({
				objectKeys: newObjectKeys,
				objectValues: newObjectValues,
				objectKeyErrors: newObjectKeyErrors,
				valid: valid
			});
		}

		this.addKeyPair = () => {
			// generate unique default key name
			let hist = {};
			for (let key of this.state.objectKeys) hist[key] = true; 
			let i = 0, key = `key${i++}`;
			while (hist[key]) key = `key${i++}`;

			let newObjectKeys = this.state.objectKeys.slice();
			let newObjectValues = this.state.objectValues.slice();
			let newObjectKeyErrors = this.state.objectKeyErrors.slice();
			newObjectKeys.push(key);
			// init
			newObjectValues.push(createComplexDataObject(""));
			newObjectKeyErrors.push(ObjectKeyErrorCode.Good);
			this.setState({
				objectKeys: newObjectKeys,
				objectValues: newObjectValues,
				objectKeyErrors: newObjectKeyErrors,
			});
		}

		/*
		Will convert "" and undefined to null if we save it in redux store
		(so that dynamoDB will not ignore it)
		*/
		this.generateObj = (convert2Null=false) => {
			let { objectKeys, objectValues } = this.state;
			let resObj = {};
			for (let i = 0; i < objectKeys.length; i++) {
				resObj[objectKeys[i]] = utils.deepCopy(objectValues[i]);
				resObj[objectKeys[i]].value = (convert2Null) ? convertToNull(resObj[objectKeys[i]].value) : resObj[objectKeys[i]].value;
			}
			return resObj;
		}

		this.copyObj = () => {
			if (this.state.valid) {
				let obj = this.generateObj();
				let objStr = JSON.stringify(obj);
				copyToLocalStorage(objStr);
				copy(stringify(obj));
				this.props.notifySuccess("Object copied !");
			} else {
				this.props.notifyError("Object is not valid !");
			}
				
		}

		this.paste = () => {
			let content = pasteFromLocalStorage();
			if (!content) {
				this.props.notifyError("Content is empty !");
			} else {
				try {
					this.unzip(JSON.parse(content));
				} catch(e) {
					this.props.notifyError(e.message);
				}
			}
		}

		this.onSubmit = () => {
			let { valid } = this.state;
			if (!valid) {
				this.props.notifyError("Object is not valid !");
				return;
			}
			this.props.onCommit(this.generateObj(true));
			this.handleClose();
		}


		this.renderRow = (key, value, i) => {
			return (
				<div style={{display: 'flex', paddingTop: (i === 0) ? 0 : 5}} key={`object-container-${i}`}>
					<ObjectKey 
						oldKey={key}
						key={`object-key-${i}`}
						errorCode={this.state.objectKeyErrors[i]}
						setObjectKey={(newKey) => {
							this.setObjectKey(key, newKey, i);
						}}
					/>
					<MenuItem key={`object-sep-${i}`} primaryText=":" disabled={true} />
					<ObjectValue
						complexDataObject={value}
						keyName={key}
						index={i}
						key={`object-value-${i}`}
						setObjectValue={(newValue) => {
							this.setObjectValue(newValue, i);
						}}
					/>
					<div style={{right: 0}} key={`object-timeline-variable-container-${i}`}>
						<TimelineVariableSelector 
							key={`object-timeline-variable-${i}`}
							onCommit={(v) => { this.setObjectTimelineVariable(v, i); }}
							value={this.state.objectValues[i].timelineVariable}
						/>
					</div>
					<div style={{right: 0}} key={`object-delete-container-${i}`}>
						<IconButton
							tooltip="delete key"
							key={`object-delete-${i}`}
							onClick={()=>{ this.deleteKeyPair(i); }}
						>
							<Clear key={`object-delete-icon-${i}`} color={clearColor} />
						</IconButton>
					</div>
				</div>
			)
		}
	}

	static defaultProps = {
		value: {},
		title: "",
		keyName: "Data",
		onCommit: (p) => {},
		Trigger: ({onClick}) => (
			<IconButton
				onClick={onClick}
				title="Click to edit"
			>
				<ObjectEditorIcon {...style.TriggerStyle}/>
			</IconButton>
		)
	}

	render() {
		let { title, keyName, Trigger } = this.props;
		let {
			handleClose,
			renderRow,
			addKeyPair,
			onSubmit,
			copyObj,
			paste,
		} = this;
		let { objectValues, objectKeys, open } = this.state;
		let actions = [
			<FlatButton 
				label="Save"
				labelStyle={{textTransform: "none", color: GeneralTheme.colors.primaryDeep}}
				onClick={onSubmit}
				keyboardFocused
			/>
		]


		return (
			<div>
				<Trigger onClick={this.handleOpen}/>
				<Dialog
					open={open}
					titleStyle={{padding: 0}}
					title={renderDialogTitle(
						<Subheader style={{fontSize: 20}}>{title}</Subheader>,
						this.handleClose,
						null
						)}
					autoScrollBodyContent={true}
					modal={true}
					actions={actions}
				>
				<div style={{display: 'flex', backgroundColor: toolbarColor}}>
					<IconButton 
						tooltip="Copy"
						iconStyle={{width: 20, height: 20}}
						style={{width: 35, height: 35, padding: 10}}
						onClick={copyObj}
					>
						<CopyIcon {...GeneralTheme.Icon} />
					</IconButton>
					<IconButton 
						tooltip="Paste"
						iconStyle={{width: 20, height: 20}}
						style={{width: 35, height: 35, padding: 10}}
						onClick={paste}
					>
						<PasteIcon {...GeneralTheme.Icon} />
					</IconButton>
				</div>
				<p style={{padding: 0, paddingTop: 10, color: 'black'}}>{`${keyName} = {`}</p>
				<div>
					<List style={{
							maxHeight: 200, 
							minHeight: 200, 
							overflow: 'auto', 
							width: "80%", 
							margin: 'auto'}}>
						{objectKeys.map((key, i) => (renderRow(key, objectValues[i], i)))}
					</List>
				</div>
				<p style={{color: 'black'}}>}</p>
				<div style={{paddingTop: 15}}>
				<FloatingActionButton 
					mini={true} 
					backgroundColor={GeneralTheme.colors.primaryDeep}
					onClick={addKeyPair}
				>
      				<ContentAdd />
    			</FloatingActionButton>
    			</div>
				</Dialog>
			</div>
		)
	}
}