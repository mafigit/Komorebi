/*jshint esversion: 6 */
import React from 'react';
import AppBar from 'material-ui/AppBar';
import MyMenu from './menu';
import Layout from './layout';
import BoardDialog from './board_dialog';

class BoardLayout extends Layout  {
  constructor(props) {
    super(props);
    this.state = {menu_open: false, story_open: false};
    this.menu_items = [
      {
        name: "Add Story",
        handler: this.handleStorydAdd
      }
    ]

  }

  handleStorydAdd = () => {
    var achor_element = this.state.menu_achor;
    this.setState({menu_open: false, story_open: true,
      menu_achor: achor_element});
  }

  handleStorySubmit = () => {
    this.setState({menu_open: false, story_open: false});
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
        touchAwayHandler={this.handleTouchTapCloseMenu} items={this.menu_items}/>
      <BoardDialog open={this.state.story_open} handleSubmit={this.handleStorySubmit}/>
      {this.props.children}
     </div>
  }
}

export default BoardLayout;
