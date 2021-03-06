import React from 'react';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
// import Divider from 'material-ui/Divider';
// import { ListItem } from 'material-ui/List';

import DeleteSubItemIcon from 'material-ui/svg-icons/navigation/close';
// import ContentAdd from 'material-ui/svg-icons/content/add';
import CollapseIcon from 'material-ui/svg-icons/navigation/more-horiz';
import ExpandIcon from 'material-ui/svg-icons/navigation/expand-more';
import EditCodeIcon from 'material-ui/svg-icons/action/code';
import AddTimelineVarIcon from 'material-ui/svg-icons/action/swap-horiz';
import AddMediaIcon from 'material-ui/svg-icons/av/library-add';
import ObjectEditorIcon from 'material-ui/svg-icons/editor/mode-edit';
import ArrayIcon from 'material-ui/svg-icons/action/view-array';
import KeyboardIcon from 'material-ui/svg-icons/hardware/keyboard';

import { isJspsychValueObjectEmpty } from '../../../reducers/Experiment/editor';
import KeyboardSelector from '../../KeyboardSelector';
import MediaManager from '../../../containers/MediaManager';
import { MediaManagerMode } from '../../MediaManager';
import CodeEditor from '../../CodeEditor';
import { ParameterMode, locateNestedParameterValue } from '../../../reducers/Experiment/editor';
import TimelineVariableSelector from '../../../containers/TimelineNodeEditor/TrialForm/TimelineVariableSelectorContainer';
import ObjectEditor from '../../../containers/ObjectEditor';
import ArrayEditor from '../../../containers/ArrayEditor';
import TrialFormItemContainer from '../../../containers/TimelineNodeEditor/TrialForm/TrialFormItemContainer';

const jsPsych = window.jsPsych;
const EnumPluginType = jsPsych.plugins.parameterType;

import GeneralTheme, { prefixer } from '../../theme.js';

const colors = {
	...GeneralTheme.colors,
	labelColor: '#757575',
	normalToggleColor: '#414141',
	dividerColor: 'rgb(224, 224, 224)',
	disabledColor: '#B1B1B1',
	evenSubItemBackgroundColor: '#F5F5F5',
	oddSubItemBackgroundColor: '#E0E0E0'
};

const ToggleGroupCommonAttrib = {
	display: 'flex',
	justifyContent: 'space-evenly',
	backgroundColor: 'inherit',
	// boxShadow: '0 2px 5px rgba(0,0,0, .26)',
	marginLeft: '10px'
};

export const style = {
	SelectFieldToggleStyle: {
		labelStyle: {
			color: colors.secondary
		},
		selectedMenuItemStyle: {
			color: colors.secondary
		}
	},
	SelectFieldStyle: {
		selectedMenuItemStyle: {
			color: colors.secondary
		}
	},
	ToggleStyle: {
		IconButton: {
			disableTouchRipple: true,
			style: {
				width: 24,
				height: 24,
				padding: 0,
			},
			iconStyle: {
				width: 16,
				height: 16
			}
		},
		Icon: toggled => ({
			color: toggled ? 'black' : '#BFBFBF',
			hoverColor: colors.secondary
		}),
	},
	ToggleGroup: prefixer({
		...ToggleGroupCommonAttrib,
	}),
	CustomFloatingLabelField: {
		root: prefixer({
			backgroundColor: 'transparent',
			fontFamily: 'Roboto, sans-serif',
			cursor: 'auto',
			width: '100%',
			display: 'flex',
			flexDirection: 'column',
			marginTop: '10px',
			marginBottom: '5px',
		}),
		FloatingLabel: prefixer({
			zIndex: '1',
			transform: 'scale(0.95) translate(-1px, -3px)',
			transformOrigin: 'left top 0px',
			pointerEvents: 'none',
			userSelect: 'none',
			color: 'rgba(0, 0, 0, 0.3)',
			display: 'inline-block',
			maxWidth: '100%',
			fontWeight: '700',
			fontSize: '13px',
			margin: 0,
		}),
		FieldGroup: prefixer({
			display: 'flex',
			alignItems: 'center'
		}),
		ContentGroup: error => (prefixer({
			flexGrow: 1,
			borderBottom: error ? `2.5px solid ${colors.errorRed}` : `none`,
			// borderBottom: error ? `2.5px solid ${colors.errorRed}` : `1px solid ${colors.dividerColor}`,
			paddingBottom: error ? '5px' : '0px',
		})),
		ErrorText: prefixer({
			color: colors.errorRed,
			// fontWeight: 'bold',
			fontSize: '12px',
			paddingTop: '5px',
			transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
			lineHeight: '12px'
		}),
		ToggleGroup: prefixer({
			...ToggleGroupCommonAttrib,
			flexBasis: 'auto',
			alignSelf: 'flex-end',
			marginBottom: '10px',
		})
	},
	TriggerStyle: {
		backgroundColor: 'rgba(153, 153, 153, 0.15)',
		hoverColor: 'rgba(153, 153, 153, 0.25)',
		labelStyle: prefixer({
			color: colors.labelColor,
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
		}),
		style: {
			maxWidth: '220px'
		},
		labelPosition: 'before',
	},
	TriggerIconStyle: {
		color: colors.labelColor,
		hoverColor: colors.secondaryDeep,
		style: {
			width: 16,
			height: 16,
		}
	},
	UndefinedStyle: {
		backgroundColor: 'rgba(153, 153, 153, 0.15)',
		hoverColor: 'rgba(153, 153, 153, 0.25)',
	},
	ComplexField: {
		expandIcon: {
			hoverColor: colors.secondary
		},
		addChildrenButtonContainer: prefixer({
			float: 'right'
		}),
		addChildrenButton: prefixer({
			label: "add"
		}),
		children: {
				root: {
					paddingLeft: '20px'
				},
				sheet: {
					root: (even) => ({
						backgroundColor: even ? colors.evenSubItemBackgroundColor : colors.oddSubItemBackgroundColor
					}),
					CloseButtonContainer: {
						float: 'right',
						margin: 0,
						marginRight: 5,
						marginTop: 5
					},
					CLoseButton: {
						iconStyle: {
							width: 16,
		    				height: 16
						},
						style: {
							width: 16,
							height: 16,
							padding: 0,
						}
					}
				}
			}
	}
}


export const components = {
	/*
	Keep them seperate in case of future changes
	*/
	Triggers: {
		ObjectEditor: ({label="Edit Object", onClick=()=>{}}) => (
			<FlatButton
				{...style.TriggerStyle}
				label={label}
				onClick={onClick}
				icon={<ObjectEditorIcon {...style.TriggerIconStyle}/>}
			/>
		),
		ArrayEditor: ({label="Edit Array", onClick=()=>{}}) => (
			<FlatButton
				{...style.TriggerStyle}
				label={label}
				onClick={onClick}
				icon={<ArrayIcon {...style.TriggerIconStyle}/>}
			/>
		),
		CodeEditor: ({label="Edit Code", onClick=()=>{}}) => (
			<FlatButton
				{...style.TriggerStyle}
				label={label}
				onClick={onClick}
				icon={<ObjectEditorIcon {...style.TriggerIconStyle}/>}
			/>
		),
		TimelineVariableSelector: ({label="Timeline Variables", onClick=()=>{}}) => (
			<FlatButton
				{...style.TriggerStyle}
				label={label}
				onClick={onClick}
				icon={<ObjectEditorIcon {...style.TriggerIconStyle}/>}
			/>
		),
		MediaSelector: ({label="Media Manager", onClick=()=>{}}) => (
			<FlatButton
				{...style.TriggerStyle}
				labelStyle={{
					...style.TriggerStyle.labelStyle,
					textTransform: 'none',
				}}
				icon={<AddMediaIcon {...style.TriggerIconStyle}/>}
				label={label}
				onClick={onClick}
			/>
		),
		KeyboardSelector: ({label="Key Choices", onClick=()=>{}}) => (
			<FlatButton
				{...style.TriggerStyle}
				labelStyle={{
					...style.TriggerStyle.labelStyle,
					textTransform: 'none',
				}}
				icon={<KeyboardIcon {...style.TriggerIconStyle}/>}
				label={label}
				onClick={onClick}
			/>
		)
	},
	Undefined: ({props={}}) => (
				<FlatButton
					disabled
					label={'[Undefined]'}
					{...props}
					{...style.UndefinedStyle}
				/>
	),
	CustomFloatingLabelField: ({label, node=null, ToggleFunc=null, ToggleTV=null, error=false, errorText=''}) => (
		<div style={{...style.CustomFloatingLabelField.root}}>
			<label style={{...style.CustomFloatingLabelField.FloatingLabel}}>
				{label}
			</label>
			<div style={{...style.CustomFloatingLabelField.FieldGroup}}>
				<div style={{...style.CustomFloatingLabelField.ContentGroup(error)}}>
					{node}
				</div>
				<div style={{...style.CustomFloatingLabelField.ToggleGroup}}>
					{ToggleFunc}
					{ToggleTV}
				</div>
			</div> 
			{error ? 
				<span style={{...style.CustomFloatingLabelField.ErrorText}}>
					{errorText}
				</span> :
				null
			}
		</div>
	)
}

// const processMediaPathTag = (s) => {
// 	if (!s) return "";
// 	if (Array.isArray(s)) {
// 		let res = [];
// 		for (let i = 0; i < s.length; i++) {
// 			res.push(s[i].replace(/<\/?path>/g, ''));
// 			if (i < s.length - 1) res.push(",");
// 		}
// 		return res.join('');
// 	} else {
// 		return s.replace(/<\/?path>/g, '');
// 	}
// }


/* 
key: string,
position: int,
next: PathNode
*/
function PathNode(key, position=-1, next=null) {
	return {
		key: key,
		position: position,
		next: next
	};
}

/* 
parameterInfo: jsPsych parameter information object (defined in jspsych), 
path: PathNode (defined above)
*/
const locateNestedParameterInfo = (paramInfo, path) => {
	let parameterInfo = paramInfo;

	if (typeof path === 'object') {
		while (path) {
			if (path.next) {
				parameterInfo = parameterInfo.nested;
				parameterInfo = parameterInfo[path.next.key];
			}
			path = path.next;
		}
	}

	return parameterInfo
}

/*
parameterInfo: jsPsych parameter information object (defined in jspsych)
*/
const isParameterRequired = (parameterInfo) => {
	let isRequired = false;
	if (parameterInfo.hasOwnProperty('default')) {
		isRequired = parameterInfo.default === undefined;
	}
	return isRequired;
}

/*
parameterValue: JspsychValueObject (defined in reducers/editor), 
parameterInfo: jsPsych parameter information object (defined in jspsych), 
autoConvertToArrayComponent: boolean
*/
const generateFieldProps = (parameterValue, parameterInfo, autoConvertToArrayComponent=true) => {
	let isRequired = isParameterRequired(parameterInfo);
	let val = utils.toEmptyString(parameterValue.value);
	let disabled = true;
	let error = isRequired && isJspsychValueObjectEmpty(parameterValue);  

	switch (parameterValue.mode) {
		case ParameterMode.USE_FUNC:
			val = '[Custom Code]';
			break;
		case ParameterMode.USE_TV:
			val = '[Timeline Variable]';
			break;
		default:
			disabled = false;
	}

	return {
		value: val,
		disabled: disabled,
		floatingLabelText: parameterInfo.pretty_name,
		errorText: error ? 'This parameter is required.' : '',
		floatingLabelFixed: true,
		title: parameterInfo.description,
		style: { marginBottom: error ? '15px' : '0px' },
		...GeneralTheme.TextFieldFocusStyle(error),
	}
}

/*
this.props should have: {
	param: Field name of a plugin's parameter
	paramInfo: jsPsych.plugins[Plugin Type].info.parameters[Field Name]
}
*/
export default class TrialFormItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			subFormCollapse: false,
		}

		this.toggleSubFormCollapse = () => {
			this.setState({
				subFormCollapse: !this.state.subFormCollapse
			})
		}
	}

	static defaultProps = {
		paramInfo: "",
		param: "",
	}

	renderToggleFunc = ({param, parameterValue, parameterInfo}) => (
		<IconButton
			onClick={() => { this.props.setParamMode(param); }}
			{...style.ToggleStyle.IconButton}
		>
			<EditCodeIcon {...style.ToggleStyle.Icon(parameterValue.mode === ParameterMode.USE_FUNC)}/>
		</IconButton>
	)

	renderToggleTV = ({param, parameterValue, parameterInfo}) => (
		<IconButton
			{...style.ToggleStyle.IconButton}
			onClick={() => { this.props.setParamMode(param, ParameterMode.USE_TV); }}
		>
			<AddTimelineVarIcon {...style.ToggleStyle.Icon(parameterValue.mode === ParameterMode.USE_TV)}/>
		</IconButton>
	)

	renderField = ({
		param,
		parameterValue,
		parameterInfo,
		node = null,
		autoConvertToArrayComponent = true,
		forceCustomFloatingLabel = false,
		onlyFunction = false,
	}) => {
		let useFunc = parameterValue.mode === ParameterMode.USE_FUNC,
			useTV = parameterValue.mode === ParameterMode.USE_TV,
			customFloatingLabel = true,
			isRequired = isParameterRequired(parameterInfo),
			error = isRequired && isJspsychValueObjectEmpty(parameterValue);  

		if (useFunc) {
			node = (
				<CodeEditor 
					Trigger={components.Triggers.CodeEditor}
					value={utils.toEmptyString(parameterValue.func.code)} 
					ifEval={!!parameterValue.func.ifEval}
					language={parameterValue.func.language}
                    onCommit={(newCode, ifEval, language) => { 
                      this.props.setFunc(param, newCode, ifEval, language);
                    }}
                    onlyFunction={onlyFunction}
                    title={`${parameterInfo.pretty_name}: `}
        		/>
			)
		} else if (useTV) {
			node = (
				<TimelineVariableSelector 
					Trigger={components.Triggers.TimelineVariableSelector}
					title={`${parameterInfo.pretty_name}: `}
					value={parameterValue.timelineVariable}
					onCommit={(newTV) => {
						this.props.setTimelineVariable(param, newTV);
					}}
				/>
			)
		} else if (!!parameterInfo.array && autoConvertToArrayComponent) {
			let val = utils.toEmptyArray(parameterValue.value), label;
			if (Array.isArray(val)) {
				label = val.length > 1 ? `${val.length} Array Items` : `${val.length} Array Item`;
			} else {
				label = '0 Array Item';
			}
			node = (
				<ArrayEditor
					Trigger={({onClick}) => (components.Triggers.ArrayEditor({label: label, onClick: onClick}))}
					value={val}
					title={`${parameterInfo.pretty_name}: `}
					keyName={param}
					onCommit={(obj) => { this.props.setObject(param, obj); }}
				/>
			)
		} else {
			customFloatingLabel = false;
		}

		let args = {
			param: param,
			parameterValue: parameterValue,
			parameterInfo: parameterInfo,
		}
		let ToggleFunc = this.renderToggleFunc(args);
		let ToggleTV = this.renderToggleTV(args);

		return (customFloatingLabel || forceCustomFloatingLabel ?
			<div className="Trial-Form-Item-Container">
				<components.CustomFloatingLabelField
					label={parameterInfo.pretty_name}
					node={node}
					ToggleFunc={ToggleFunc}
					ToggleTV={ToggleTV}
					error={error}
					errorText={error ? 'This parameter is required.' : ''}
				/>
			</div> :
			<div className="Trial-Form-Item-Container">
				{node}
				<div style={{...style.ToggleGroup}}>
					{ToggleFunc}
					{ToggleTV}
				</div>
			</div>
			);
	}

	renderTextField = (param) => {
		let parameterValue = locateNestedParameterValue(this.props.parameters, param);
		let parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param);
		let args = {
			param: param,
			parameterValue: parameterValue,
			parameterInfo: parameterInfo,
			node: (
				<TextField
			      id={"text-field-"+param}
			      min={-1}
			      fullWidth={true}
			      onChange={(e, v) => { this.props.setText(param, v); }}
			      {...generateFieldProps(parameterValue, parameterInfo)}
			    />
			)
		}
		return this.renderField(args);
	}

	renderNumberField = (param) => {
		let parameterValue = locateNestedParameterValue(this.props.parameters, param),
			parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param),
			props = generateFieldProps(parameterValue, parameterInfo);
		props.type = props.disabled ? 'text' : 'number';
		let args = {
			param: param,
			parameterValue: parameterValue,
			parameterInfo: parameterInfo,
			node: (
				<TextField
			      type="number"
			      id={"number-field-"+param}
			      fullWidth={true}
			      onChange={(e, v) => {
						this.props.setNumber(param, v, EnumPluginType.FLOAT===this.props.paramInfo.type);
					}}
				  {...props}
			    />
			)
		}
		return this.renderField(args);
	}

	renderToggle = (param) => {
		let parameterValue = locateNestedParameterValue(this.props.parameters, param),
			parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param),
			props = generateFieldProps(parameterValue, parameterInfo, false),
			items = [
				<MenuItem key={`toggle-field-${param}-1`} value={true}  primaryText="True"/>,
				<MenuItem key={`toggle-field-${param}-2`} value={false}  primaryText="False"/>
			];
		let args = {
			param: param,
			parameterValue: parameterValue,
			parameterInfo: parameterInfo,
			node: (
				<SelectField
		          onChange={(event, index, value) => { this.props.setToggle(param, value)}}
		          {...style.SelectFieldToggleStyle}
		          {...props}
		        >
		          {items}
		        </SelectField>
			)
		}
		return this.renderField(args);
	}

	renderFunctionEditor = (param) => {
		let parameterValue = locateNestedParameterValue(this.props.parameters, param),
			parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param);
		let args = {
			param: param,
			parameterInfo: parameterInfo,
			parameterValue: parameterValue,
			node: <components.Undefined />,
			forceCustomFloatingLabel: true,
			autoConvertToArrayComponent: false,
			onlyFunction: true,
		}	
		return this.renderField(args);
	}

	renderKeyboardInput = (param) => {

		let parameterValue = utils.deepCopy(locateNestedParameterValue(this.props.parameters, param)),
		    parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param);

		let node = (
			<KeyboardSelector
				value={parameterValue.value}
				onCommit={(value) => { this.props.setKey(param, value); }}
				parameterName={parameterInfo.pretty_name}
				Trigger={({label='Key Choices', onClick}) => (
					components.Triggers.KeyboardSelector({label: label, onClick: onClick})
				)}
				multiSelect={parameterInfo.array}
			/>
		)

		let args = {
			param: param,
			parameterValue: parameterValue,
			parameterInfo: parameterInfo,
			node: node,
			autoConvertToArrayComponent: false,
			forceCustomFloatingLabel: true
		}

		return this.renderField(args);
	}

	renderSelect = (param) => {
		let parameterValue = locateNestedParameterValue(this.props.parameters, param),
			parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param),
			props = generateFieldProps(parameterValue, parameterInfo, false);
		let args = {
			param: param,
			parameterValue: parameterValue,
			parameterInfo: parameterInfo,
			node: (
				<SelectField
					multiple={!!parameterInfo.array}
					id={this.props.id+"-select-field-"+param}
			    	onChange={(event, index, value) => {
			    		this.props.setText(param, value);
			    	}}
			    	{...style.SelectFieldStyle}
			    	{...props}
			    >
			    	{
			    		parameterInfo.options && parameterInfo.options.map((op, i) => (
			    			<MenuItem value={op} primaryText={op} key={op+"-"+i}/>
			    		))
			    	}
			    </SelectField>
			)
		}
		return this.renderField(args);
	}

	renderMediaSelector = (param) => {

		let parameterValue = locateNestedParameterValue(this.props.parameters, param),
			parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param),
			multiSelect = !!parameterInfo.array,
			val = parameterValue && parameterValue.value;

		let f = s => s && s.replace('<path>', '').replace('</path>', '');
		// selected files, displayed label
		let selected, label;
		if (Array.isArray(val)) {
			selected = val && val.map(l => f(l));
		} else {
			selected = val ? [f(val)] : [];
		}
		if (selected && selected.length > 0) {
			// show ... if more than 1 files
			label = `${selected[0]} ${selected.length > 1 ? ' ...' : ''}`;
		} else {
			// if none, prompt user to select media
			label = 'Select Media';
		}

		let args = {
			param: param,
			parameterValue: parameterValue,
			parameterInfo: parameterInfo,
			node: (
				<MediaManager 
					Trigger_insert={({onClick}) => (components.Triggers.MediaSelector({label: label, onClick: onClick}))}
					parameterName={param} 
					selected={selected}
					mode={(!multiSelect) ? MediaManagerMode.select : MediaManagerMode.multiSelect}
					onCommit={(value) => {
						this.props.insertFile(
							param,
							value
						);
					}}
				/>
			),
			forceCustomFloatingLabel: true,
			autoConvertToArrayComponent: false
		};
		return this.renderField(args);
	}

	renderObjectEditor = (param) => {
		let parameterValue = locateNestedParameterValue(this.props.parameters, param),
			parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param);
		let args = {
			param: param,
			parameterInfo: parameterInfo,
			parameterValue: parameterValue,
			node: (
				<ObjectEditor
					Trigger={components.Triggers.ObjectEditor}
					value={parameterValue.value}
					title={`${parameterInfo.pretty_name}: `}
					keyName={param}
					onCommit={(obj) => { this.props.setObject(param, obj); }}
				/>
			),
			forceCustomFloatingLabel: true,
			autoConvertToArrayComponent: false
		}	
		return this.renderField(args);
	}

	renderComplex = (param) => {

		/*
		parameterValue = {
			value: [], // must be array
		}
		*/
		let parameterValue = locateNestedParameterValue(this.props.parameters, param);
		let parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param);
		let expandToggle = (
			<IconButton
  				tooltip={(this.state.subFormCollapse) ? "Expand" : "Collapse"}
  				onClick={this.toggleSubFormCollapse}
  			>
	  			{
	  				(this.state.subFormCollapse) ? 
	  					<CollapseIcon {...style.ComplexField.expandIcon} /> :
	  					<ExpandIcon {...style.ComplexField.expandIcon} />
	  			}
  			</IconButton>
		)

		let children = (
			<div style={{...style.ComplexField.children.root}}>
		    	{
		    		Array.isArray(parameterValue.value) && parameterValue.value.map((p, i) => {
		    			let items = Object.keys(parameterInfo.nested) && Object.keys(parameterInfo.nested).map((key, j) => {
		    				let newParam = utils.deepCopy(param);
			    			if (typeof newParam !== 'object') {
			    				newParam = new PathNode(newParam);
			    			}
			    			let cur = newParam;
			    			while (cur.next) cur = cur.next;
			    			cur.next = new PathNode(key, i);
			    			return <TrialFormItemContainer 
			    						key={`${this.props.param}-${key}-${j}`}
			    						param={cur}
			    						paramInfo={this.props.paramInfo}
			    					/>
		    			});

		   				return (
		   					<div 
		   						key={`complex-jsPysch-trial-item-container-${i}`} 
		   						style={{
		   							...style.ComplexField.children.sheet.root(i%2 === 0),
		   						}}
		   						>
		   						<div 
		   							style={{ ...style.ComplexField.children.sheet.CloseButtonContainer}}
		   							key={`complex-jsPysch-trial-item-delete-conainer-${i}`} 
		   						>
			   						<IconButton  
			   							key={`complex-jsPysch-trial-item-delete-${i}`} 
			   							onClick={() => {this.props.depopulateComplex(param, i)}}
			   							{...style.ComplexField.children.sheet.CLoseButton}
			   						>
			   							<DeleteSubItemIcon />
			   						</IconButton>
		   						</div>
		   						{items}
		   					</div>
		   				)

		    		})
		    	}
		    	<div style={{...style.ComplexField.addChildrenButtonContainer}}>
			    	<FlatButton
			    		{...style.ComplexField.addChildrenButton}
			    		onClick={() => {this.props.populateComplex(param, parameterInfo.nested)}}
			    	/>
		    	</div>
		    </div>
		)

		let args = {
			param: param,
			parameterInfo: parameterInfo,
			parameterValue: parameterValue,
			forceCustomFloatingLabel: true,
			autoConvertToArrayComponent: false,
			node: expandToggle
		}

		let useFunc = parameterValue.mode === ParameterMode.USE_FUNC,
			useTV = parameterValue.mode === ParameterMode.USE_TV;
		return (
			<div> 
				{this.renderField(args)} 
				{(this.state.subFormCollapse || useFunc || useTV) ? null : children}
			</div>
		)
	}

	renderItem = (param) => {
		let parameterInfo = locateNestedParameterInfo(this.props.paramInfo, param);
		switch(parameterInfo.type) {
				case EnumPluginType.AUDIO:
				case EnumPluginType.IMAGE:
				case EnumPluginType.VIDEO:
					return this.renderMediaSelector(param);
				case EnumPluginType.BOOL:
					return this.renderToggle(param);
				case EnumPluginType.INT:
				case EnumPluginType.FLOAT:
					return this.renderNumberField(param);
				case EnumPluginType.FUNCTION:
					return this.renderFunctionEditor(param);
				// same different
				case EnumPluginType.SELECT:
					return this.renderSelect(param);
				case EnumPluginType.KEYCODE:
					return this.renderKeyboardInput(param);
				case EnumPluginType.OBJECT:
					return this.renderObjectEditor(param);
				case EnumPluginType.COMPLEX:
					return this.renderComplex(param);
				case EnumPluginType.HTML_STRING:
				case EnumPluginType.STRING:
				default:
					return this.renderTextField(param);
		}
	}

	render() {
		return (
			this.renderItem(this.props.param)
		)
	}
}