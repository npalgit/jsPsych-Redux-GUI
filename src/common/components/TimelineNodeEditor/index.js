import React from 'react';
import Subheader from 'material-ui/Subheader';
import IconButton from 'material-ui/IconButton';
import Divider from 'material-ui/Divider';
import { List } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

import TrialForm from '../../containers/TimelineNodeEditor/TrialForm';
import TimelineForm from '../../containers/TimelineNodeEditor/TimelineForm';

import CloseDrawer from 'material-ui/svg-icons/navigation/close';
import OpenDrawer from 'material-ui/svg-icons/navigation/chevron-left';
import {
	grey300 as popDrawerColor,
	grey400 as DrawerHandleColor,
	grey300 as CloseBackHighlightColor,
	grey50 as CloseDrawerHoverColor
} from 'material-ui/styles/colors';

//<TimelineForm id={this.props.id} />
export default class TimelineNodeEditorDrawer extends React.Component {

	render() {
		return (
			<div className="TimelineNode-Editor"
					style={{width: (this.props.open) ? '20%': '0%',
						right: '0px',
						height: '86.5vh',
						display: 'flex',
						'WebkitTransition': 'all 0.4s ease',
						'MozTransition': 'all 0.4s ease',
						transition: 'all 0.4s ease',
						}}>
				<div className="TimelineNode-Editor-Container"
					style={{
						height: '100%',
						width: '100%',
						borderLeft: (this.props.open) ? '1px solid #aaa' : '1px solid #aaa'
					}}>
					{(this.props.open) ?
					<div className="TimelineNode-Editor-Content">
						<div style={{display: 'flex'}}>
							<IconButton
							disableTouchRipple={true}
	  						hoveredStyle={{backgroundColor: CloseBackHighlightColor}}
							onTouchTap={this.props.closeTimelineEditorCallback}
							>{(this.props.open) ? <CloseDrawer hoverColor={CloseDrawerHoverColor}/> : null}</IconButton>
							<Subheader>Timeline/Trial Editor</Subheader>
						</div>
						<Divider />
						{(this.props.previewId) ?
							<Paper style={{
								padding: 5, 
								overflowY: 'auto', 
								maxHeight: 455, 
								minHeight: 455,
								paddingTop: 0
							}} 
								zDepth={0}
							>
								<List style={{padding: 5, paddingTop: 0, width: '95%'}}>
									<TextField
											floatingLabelText={this.props.label}
											id="Node-Name-Textfield"
			                				value={this.props.nodeName}
											onChange={this.props.changeNodeName} />
									{this.props.isTimeline ?
										<TimelineForm id={this.props.previewId} /> :
										<TrialForm id={this.props.previewId} pluginType={this.props.pluginType} />
									}

								</List> 
							</Paper> :
						null}
					</div> : 
					null}
					<Divider />
				</div>
  				{(this.props.open) ? null :
  					<IconButton
  						className="TimelineNode-Editor-Handle"
  						tooltip="Open Timeline/Trial Editor"
  						hoveredStyle={{
  							backgroundColor: DrawerHandleColor,
  							right: 0,
  						}}
  						onTouchTap={this.props.openTimelineEditorCallback}
  						tooltipPosition="bottom-left"
  						style={{
	  					position: 'fixed',
	  					right: -8,
	  					top: '50%',
	  					width: 25,
	  					backgroundColor: popDrawerColor,
	  					padding: '12px 0',
	  					zIndex: 1,
  				}}><OpenDrawer /></IconButton>}
  			</div>
  			)
	}
}
