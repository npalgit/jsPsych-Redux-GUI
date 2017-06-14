import React from 'react';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import Menu from 'material-ui/Menu';
import Popover from 'material-ui/Popover';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import CollapsedIcon from 'material-ui/svg-icons/navigation/chevron-right';
import ExpandedIcon from 'material-ui/svg-icons/navigation/expand-more';
import CheckIcon from 'material-ui/svg-icons/toggle/radio-button-checked';
import UnCheckIcon from 'material-ui/svg-icons/toggle/radio-button-unchecked';
import NewTimelineIcon from 'material-ui/svg-icons/av/playlist-add';
import NewTrialIcon from 'material-ui/svg-icons/action/note-add';
import Delete from 'material-ui/svg-icons/action/delete';
import {
	cyan400 as highlightColor,
	green500 as checkColor,
	indigo500 as iconHighlightColor,
	grey300 as hoverColor,
	grey900 as normalColor,
} from 'material-ui/styles/colors';

import { contextMenuStyle } from './TrialItem';

import { DropTarget, DragSource } from 'react-dnd';
import flow from 'lodash/flow';
import { findDOMNode } from 'react-dom';
import { DRAG_TYPE } from '../../../reducers/timelineNode';
import { updateTreeAction } from '../../../actions/timelineNodeActions';

import Tree from '../../../containers/TimelineNode/OrganizerItem/TreeContainer';

const timelineSource = {
  beginDrag(props) {
    return {
      id: props.id,
      parent: props.parent,
      children: props.children
    };
  },

  isDragging(props, monitor) {
    return props.id === monitor.getItem().id;
  }
};

const timelineTarget = {
	canDrop() {
		return false;
	},

  	hover(props, monitor, component) {
	  	const {id: draggedId } = monitor.getItem()
	    const {id: overId } = props

	    if (draggedId === overId || draggedId === props.parent) return;
	    if (!monitor.isOver({shallow: true})) return;

	    props.move(draggedId, overId, props.parent);
	    props.dispatch(updateTreeAction(props.treeData));
	},
};

const sourceCollector = (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	connectDragPreview: connect.dragPreview(),
	isDragging: monitor.isDragging(),
	draggedItem: monitor.getItem()
})

const targetCollector = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver(),
	isOverCurrent: monitor.isOver({ shallow: true }),
})

class TimelineItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			contextMenuOpen: false,
		}

		this.openContextMenu = (event) => {
			event.preventDefault();
			event.stopPropagation();
			this.setState({
				contextMenuOpen: true,
				anchorEl: event.currentTarget, 
			})
		}

		this.closeContextMenu = () => {
			this.setState({
				contextMenuOpen: false
			})
		}
	}

	render() {
		const {
			connectDropTarget,
			connectDragPreview,
			connectDragSource,
			isOver,
			isOverCurrent,
		} = this.props;
		
		let hovered = isOver && isOverCurrent;

		const colorSelector = (hovered, isSelected) => {
			if (hovered)
				return null;

			if (isSelected)
				return highlightColor;

			return null;
		} 

		let key = 0;

		return connectDragPreview(connectDropTarget(
				<div>
					<MuiThemeProvider>
					<div className="Organizer-Item" style={{
									display: 'flex',
									backgroundColor: colorSelector(hovered, this.props.isSelected),
									height: "50%",
								}}>
							{connectDragSource(<div>
								<IconButton className="Timeline-Collapse-Icon"
										hoveredStyle={{backgroundColor: hoverColor}}
										onTouchTap={this.props.toggleCollapsed} 
										disableTouchRipple={true} 
							>
								{(this.props.collapsed || this.props.hasNoChildren) ? 
									<CollapsedIcon color={(this.props.isSelected) ? iconHighlightColor : normalColor} /> : 
									<ExpandedIcon color={(this.props.isSelected) ? iconHighlightColor : normalColor} />
								}
							</IconButton>
							</div>)}
							<div style={{width: "100%"}}>
								<ListItem 
										primaryText={this.props.name}
										onContextMenu={this.openContextMenu}
										onTouchTap={(e) => {
											if (e.nativeEvent.which === 1) {
												this.props.onClick();
											}
										}}
										rightIconButton={
											<IconButton 
												disableTouchRipple={true}
												onTouchTap={this.props.onToggle} 
											>
											{(this.props.isEnabled) ? <CheckIcon color={checkColor} /> : <UnCheckIcon />}/>
											</IconButton>
										}/>
							</div>
							<Popover
					          open={this.state.contextMenuOpen}
					          anchorEl={this.state.anchorEl}
					          anchorOrigin={{horizontal: 'middle', vertical: 'bottom'}}
					          targetOrigin={{horizontal: 'middle', vertical: 'top'}}
					          onRequestClose={this.closeContextMenu}
					        >
					        <Menu>
								<MenuItem primaryText="New Timeline" 
									leftIcon={<NewTimelineIcon color={contextMenuStyle.iconColor} />}
									onTouchTap={()=>{ this.props.insertTimeline(); this.closeContextMenu()}}
								/>
								<Divider />
								<MenuItem primaryText="New Trial"  
									leftIcon={<NewTrialIcon color={contextMenuStyle.iconColor}/>}
									onTouchTap={()=>{ this.props.insertTrial(); this.closeContextMenu()}}
								/>
								<Divider />
								<MenuItem primaryText="Delete"  
									leftIcon={<Delete color={contextMenuStyle.iconColor}/>}
									onTouchTap={()=>{ this.props.deleteItem(); this.closeContextMenu()}}
								/>
							</Menu>
							</Popover>
					</div>	
					</MuiThemeProvider>
					<div style={{paddingLeft: 32}}>
						<Tree parent={this.props.id}
							  children={this.props.children}
							  move={this.props.move}
							  find={this.props.find}
							  treeData={this.props.treeData}
							  collapsed={this.props.collapsed}
							  openTimelineEditorCallback={this.props.openTimelineEditorCallback}
							  closeTimelineEditorCallback={this.props.closeTimelineEditorCallback} />
					</div>
				</div>
		))
	}
}

export default flow(
	DragSource(
		"Organizer-Item",
		timelineSource,
		sourceCollector),
	DropTarget(
		"Organizer-Item",
		timelineTarget,
		targetCollector))(TimelineItem);