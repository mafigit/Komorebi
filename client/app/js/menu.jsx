/*jshint esversion: 6 */
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

class MyMenu extends React.Component {

  constructor(props) {
    super(props);
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
            {this.props.items.map((item, key) => {
              return <MenuItem key={key} primaryText={item.name}
                onTouchTap={item.handler} />
            })}
          </Menu>
        </Popover>
      </div>
    );
  }
}
export default MyMenu;
