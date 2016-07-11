/*jshint esversion: 6 */
import React from 'react';
import AppBar from 'material-ui/AppBar';
import MyMenu from './menu';

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {menu_open: false};
  }

  handleTouchTapMenuBtn = (event) => {
    event.preventDefault();
    this.setState({menu_open: true, menu_achor: event.currentTarget});
  }

  handleTouchTapCloseMenu = () => {
    var achor_element = this.state.menu_achor;
    this.setState({menu_open: false, menu_achor: achor_element});
  }

  render() {
    return <div>
      <AppBar
        title={this.props.title}
        iconClassNameRight="muidocs-icon-navigation-expand-more"
        onLeftIconButtonTouchTap={this.handleTouchTapMenuBtn}
      />
      <MyMenu open={this.state.menu_open} achor={this.state.menu_achor}
        touchAwayHandler={this.handleTouchTapCloseMenu}/>
      {this.props.children}
     </div>
  }
}

export default Layout;
