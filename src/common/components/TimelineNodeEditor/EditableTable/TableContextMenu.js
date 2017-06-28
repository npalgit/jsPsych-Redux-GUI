import React from 'react';
import Menu from 'material-ui/Menu';
import Popover from 'material-ui/Popover';
import MenuItem from 'material-ui/MenuItem';

class TableContextMenu extends React.Component{

	render(){
		return (
            <div>
			<Popover
				open={this.props.openContext}
				anchorEl={this.props.anchorEl}
				anchorOrigin= {{horizontal:"left",vertical:"top"}}
				targetOrigin= {{horizontal:"right",vertical:"top"}}
				onRequestClose={this.props.handleCloseContext} >
				<Menu>
					<MenuItem value={1} primaryText="Delete Row"
					onTouchTap={()=>{ this.props.onDeleteRow(); this.props.handleCloseContext()}} />
					<MenuItem value={0} primaryText="Delete Column"
					onTouchTap={()=>{ this.props.onDeleteColumn(); this.props.handleCloseContext()}} />
				</Menu>
			</Popover>

			<Popover
				open={this.props.openHeader}
				anchorEl={this.props.anchorEl}
				anchorOrigin= {{horizontal:"left",vertical:"top"}}
				targetOrigin= {{horizontal:"right",vertical:"top"}}
				onRequestClose={this.props.handleCloseHeader} >
				<Menu>
					<MenuItem value={1} primaryText="Delete Column"
					onTouchTap={()=>{ this.props.onDeleteColumnByHeader(); this.props.handleCloseHeader()}} />
				</Menu>
			</Popover>
			</div>
			)
	}
}

export default TableContextMenu;
