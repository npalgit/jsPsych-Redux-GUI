import React from 'react';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import MenuItem from 'material-ui/MenuItem';
import { ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import SelectField from 'material-ui/SelectField';
import {
  green500 as checkColor,
  cyan500 as boxCheckColor,
} from 'material-ui/styles/colors';
import CheckIcon from 'material-ui/svg-icons/toggle/radio-button-checked';
import UnCheckIcon from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import BoxCheckIcon from 'material-ui/svg-icons/toggle/check-box';
import BocUncheckIcon from 'material-ui/svg-icons/toggle/check-box-outline-blank';
import { convertNullToEmptyString } from '../../../utils';
import MediaManager from '../../../containers/MediaManager';
import { MediaManagerMode } from '../../MediaManager';
import CodeEditorTrigger from '../../CodeEditorTrigger';
import { ParameterMode } from '../../../reducers/Experiment/editor';
import TimelineVariableSelector from '../../../containers/TimelineNodeEditor/TrialForm/TimelineVariableSelectorContainer';

const jsPsych = window.jsPsych;
const EnumPluginType = jsPsych.plugins.parameterType;

export const labelStyle = {
	paddingTop: 15,
	paddingRight: 10,
	color: 'black'
}

/*
props explanations:

param: Field name of a plugin's parameter
paramInfo: jsPsych.plugins[Plugin Type].info.parameters[Field Name]

*/
export default class TrialFormItem extends React.Component {
	static defaultProps = {
		paramInfo: "",
		param: "",
	}

	state = {
		showTool: false,
		// function editor dialog
		openFuncEditor: false, 
		// timeline variable selector dialog
		openTimelineVariable: false,
		keyListStr: "",
	}

	componentDidMount() {
		this.setState({
			keyListStr: this.props.parameters[this.props.param].value
		});
	}

	setKeyListStr = (str) => {
		this.setState({
			keyListStr: str
		});
	}

	showTool = () => {
		this.setState({
			showTool: true
		});
	}

	hideTool = () => {
		this.setState({
			showTool: false
		});
	}

	showFuncEditor = () => {
		this.setState({
			openFuncEditor: true
		});
	}

	hideFuncEditor = () => {
		this.setState({
			openFuncEditor: false
		});
	}

	showTVSelector = () => {
		this.setState({
			openTimelineVariable: true
		});
	}

	hideTVSelector = () => {
		this.setState({
			openTimelineVariable: false
		});
	}

	renderLabel = () => (
		<p
			className="Trial-Form-Label-Container"
		    style={labelStyle}
		    title={this.props.paramInfo.description}
		>
		    {this.props.paramInfo.pretty_name+": "}
		</p>
	)

	appendFunctionEditor = (param, alternate=null) => (
		(this.state.showTool || this.state.openFuncEditor || this.props.parameters[param].mode === ParameterMode.USE_FUNC) ?
			    <CodeEditorTrigger 
			    	setParamMode={() => { this.props.setParamMode(param); }}
					useFunc={this.props.parameters[param].mode === ParameterMode.USE_FUNC}
					showEditMode={true}
					initCode={convertNullToEmptyString(this.props.parameters[param].func.code)} 
					openCallback={this.showFuncEditor}
					closeCallback={this.hideFuncEditor}
                    submitCallback={(newCode) => { 
                      this.props.setFunc(param, newCode);
                    }}
                    title={this.props.paramInfo.pretty_name+": "}
        		/>:
        		alternate
	)

	appendTimelineVariable = (param, alternate=null) => (
		(this.state.showTool || this.state.openTimelineVariable || this.props.parameters[param].mode === ParameterMode.USE_TV) ?
		<TimelineVariableSelector 
			openCallback={this.showTVSelector}
			closeCallback={this.hideTVSelector}
			useTV={this.props.parameters[param].mode === ParameterMode.USE_TV}
			title={this.props.paramInfo.pretty_name+": "}
			selectedTV={this.props.parameters[param].timelineVariable}
			submitCallback={(newTV) => {
				this.props.setTimelineVariable(param, newTV);
			}}
			setParamMode={() => { this.props.setParamMode(param, ParameterMode.USE_TV); }}
		/> :
		null
	)

	renderFieldContent = (param, node) => {
		switch(this.props.parameters[param].mode) {
			case ParameterMode.USE_FUNC:
				return <MenuItem primaryText="[Function]" style={{paddingTop: 2}} disabled={true} />;
			case ParameterMode.USE_TV:
				return <MenuItem
							primaryText="[Timeline Variable]"
							style={{paddingTop: 2}} 
							disabled={true} />;
			default:
				return node;
		}
	}
	// primaryText={`[${(this.props.parameters[param].timelineVariable ? this.props.parameters[param].timelineVariable : "Timeline Variable")}]`}
	
	renderTextField = (param, onChange=()=>{}, type="text") => {
		return (
		  <div style={{display: 'flex', width: "100%"}} >
			{this.renderLabel()}
		    <div className="Trial-Form-Content-Container" onMouseEnter={this.showTool} onMouseLeave={this.hideTool}>
		    {this.renderFieldContent(param,
			    <TextField
			      id={"text-field-"+type+"-"+param}
			      value={convertNullToEmptyString(this.props.parameters[param].value)}
			      type={type}
			      fullWidth={true}
			      onChange={onChange}
			    />)
			}
			{this.appendFunctionEditor(param)}
			{this.appendTimelineVariable(param)}
		    </div>
		  </div>
	  )}

	renderToggle = (param) => (
		<div style={{display: 'flex', width: "100%", position: 'relative'}}>
	      	{this.renderLabel()}
	      	<div className="Trial-Form-Content-Container" onMouseEnter={this.showTool} onMouseLeave={this.hideTool} >
	      		{this.renderFieldContent(param,
			        <IconButton 
			          onTouchTap={() => { this.props.setToggle(param); }} 
			          >
			        {(this.props.parameters[param].value) ? <CheckIcon color={checkColor} /> : <UnCheckIcon />}/>
			        </IconButton>)
			    }
			    {this.appendFunctionEditor(param)}
			    {this.appendTimelineVariable(param)}
	        </div>
	    </div>
	)

	renderFunctionEditor = (param) => (
		<div style={{display: 'flex', width: "100%", position: 'relative'}}>
	      	{this.renderLabel()}
	      	<div className="Trial-Form-Content-Container">
			    <CodeEditorTrigger 
					initCode={convertNullToEmptyString(this.props.parameters[param].func.code)} 
                    submitCallback={(newCode) => { 
                      this.props.setFunc(param, newCode);
                    }}
                    title={param+": "}
        		/>
        		{this.appendTimelineVariable(param)}
	        </div>
	    </div>
	)

	renderKeyboardInput = (param) => {
		let value = this.props.parameters[param].value;
		if (Array.isArray(value)) {
			let s = "";
			for (let v of value) {
				if (v === jsPsych.ALL_KEYS) s += v;
				else if (v.length > 1) s += `{${v}}`;
				else s += v;
			}
			value = s;
		}
		let useFunc = this.props.parameters[param].mode === ParameterMode.USE_FUNC;
		let isAllKey = value === jsPsych.ALL_KEYS;
		let isArray = !!this.props.paramInfo.array;

		let alternativeNode = (<IconButton 
				onTouchTap={() => {
					if (isAllKey) {
						this.props.setKey(param, null, true);
					} else {
						this.props.setKey(param, jsPsych.ALL_KEYS, true);
					}
				}}
				tooltip="All Keys"
				onMouseEnter={this.hideTool} onMouseLeave={this.showTool}
			>
				{(isAllKey) ? <BoxCheckIcon color={boxCheckColor} /> : <BocUncheckIcon />}
			</IconButton>);

		return (
			<div style={{display: 'flex', width: "100%"}} >
			{this.renderLabel()}
		    <div 
		    	className="Trial-Form-Content-Container" 
		    	onMouseEnter={(isAllKey) ? ()=>{} : this.showTool} 
		    	onMouseLeave={this.hideTool}
		    >
		    {this.renderFieldContent(param,
			    (isAllKey) ?
			    <MenuItem primaryText="[ALL KEYS]" style={{paddingTop: 2}} disabled={true} />:
			    <TextField
			      id={"text-field-"+"-"+param}
			      value={(this.state.keyListStr !== value) ? this.state.keyListStr : convertNullToEmptyString(value)}
			      fullWidth={true}
			      onChange={(e, v) => { this.setKeyListStr(v); }}
			      maxLength={(isArray) ?  null : "1"}
			      onFocus={() => {
			      	this.setKeyListStr(convertNullToEmptyString(value));
			      }}
			      onBlur={() => {
			      	this.props.setKey(param, this.state.keyListStr, false, isArray);
			      }}
			      onKeyPress={(e) => {
			      	if (e.which === 13) {
			      		document.activeElement.blur();
			      	}
			      }}
			    />)
			}
			{this.appendFunctionEditor(param, alternativeNode)}
			{this.appendTimelineVariable(param, alternativeNode)}
		    </div>
		  </div>
	)}

	renderSelect = (param) => {
		return (
			<div style={{display: 'flex', width: "100%", position: 'relative'}}>
	      	{this.renderLabel()}
	      	<div className="Trial-Form-Content-Container" onMouseEnter={this.showTool} onMouseLeave={this.hideTool} >
	      		{this.renderFieldContent(param,
				    <SelectField
				    	value={convertNullToEmptyString(this.props.parameters[param].value)}
				    	onChange={(event, index, value) => {
				    		this.props.setText(param, value);
				    	}}
				    >
				    {this.props.paramInfo.options.map((op, i) => (
				    	<MenuItem value={op} primaryText={op} key={op+"-"+i}/>
				    ))}
				    </SelectField>)
				}
				{this.appendFunctionEditor(param)}
	        </div>
	    </div>
		)
	}

	renderItem = () => {
		let { paramInfo, param, parameters } = this.props;
		let paramType = paramInfo.type;
		switch(paramType) {
				case EnumPluginType.AUDIO:
				case EnumPluginType.IMAGE:
				case EnumPluginType.VIDEO:
					// check if is array
					let multiSelect = !!paramInfo.array;
					return (
						<MediaManager 
							parameterName={param} 
							paramInfo={paramInfo}
							key={"Trial-form-"+param} 
							mode={(!multiSelect) ? MediaManagerMode.select : MediaManagerMode.multiSelect}

							PropertyTitle={this.props.paramInfo.pretty_name+": "}
							openCallback={this.showFuncEditor}
							closeCallback={this.hideFuncEditor}

							setParamModeToFunc={() => { this.props.setParamMode(param); }}
							initCode={convertNullToEmptyString(this.props.parameters[param].func.code)} 
							useFunc={this.props.parameters[param].mode === ParameterMode.USE_FUNC}
		                    submitFuncCallback={(newCode) => { this.props.setFunc(param, newCode); }}

		                    useTV={this.props.parameters[param].mode === ParameterMode.USE_TV}
							selectedTV={this.props.parameters[param].timelineVariable}
							submitTVCallback={(newTV) => { this.props.setTimelineVariable(param, newTV); }}
							setParamModeToTV={() => { this.props.setParamMode(param, ParameterMode.USE_TV); }}
						/>
					);
				case EnumPluginType.BOOL:
					return this.renderToggle(param);
				case EnumPluginType.INT:
				case EnumPluginType.FLOAT:
					return this.renderTextField(param, (e, v) => {
						this.props.setNumber(param, v, EnumPluginType.FLOAT===paramType);
					}, "number");
				case EnumPluginType.FUNCTION:
					return this.renderFunctionEditor(param);
				// same different
				case EnumPluginType.SELECT:
					return this.renderSelect(param);
				case EnumPluginType.KEYCODE:
					return this.renderKeyboardInput(param);
				case EnumPluginType.HTML_STRING:
				case EnumPluginType.STRING:
				default:
					return this.renderTextField(param, (e, v) => { this.props.setText(param, v); });
		}
	}

	render() {
		return (
			this.renderItem()
		)
	}
}