/*jshint esversion: 6 */
import React from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import BoardActions from './actions/BoardActions';

class MyMenu extends React.Component {

  constructor(props) {
    super(props);
    var menu_items = [
      {
        name: "Add Task",
        action: BoardActions.showTaskDialog
      },
      {
        name: "Add Story",
        action: BoardActions.openStoryEditDialog
      },
      {
        name: "Add Story from Issue ID",
        action: BoardActions.openStoryFromIssueEditDialog
      },
      {
        name: "Add Column",
        action: BoardActions.showColumnDialog
      }
    ];
    this.menu_items = this.props.items || menu_items
  }

  render() {
    return (
      <div>
        <Popover
          open={this.props.open}
          anchorEl={this.props.achor}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.props.touchAwayHandler}
        >
          <Menu>
            {this.menu_items.map((item, key) => {
              return <MenuItem
                key={key}
                primaryText={item.name}
                onTouchTap={item.action}
              />;
            })}
          </Menu>
        </Popover>
      </div>
    );
  }
}
export default MyMenu;
