/*jshint esversion: 6 */
import React from 'react';
import AppBar from 'material-ui/AppBar';
import MyMenu from './menu';
import Layout from './layout';
import BoardDialog from './board_dialog';
import {List, ListItem} from 'material-ui/List';
import Ajax from  'basic-ajax';

class LandingLayout extends Layout  {
  constructor(props) {
    super(props);
    this.state = {
      list_items: [],
      menu_open: false,
      board_open: false
    };
    this.menu_items = [
      {
        name: "Add Board",
        handler: this.handleBoardAdd
      }
    ]
  }

  getBoards = () => {
    Ajax.getJson('/boards').then(response => {
      var boards = JSON.parse(response.response);
      this.setState({list_items: boards.reverse()});
    });
  }

  componentDidMount = () => {
    this.getBoards();
  }

  handleTouchTapMenuBtn = (event) => {
    event.preventDefault();
    this.setState({menu_open: true, menu_achor: event.currentTarget});
  }

  handleTouchTapCloseMenu = () => {
    var achor_element = this.state.menu_achor;
    this.setState({menu_open: false, menu_achor: achor_element});
  }

  handleBoardAdd = () => {
    var achor_element = this.state.menu_achor;
    this.setState({board_open: true, menu_open: false, menu_achor: achor_element});
  }

  handleBoardAddClose = (submit) => {
    this.setState({board_open: false, menu_open: false});
    this.getBoards();
  }

  handleListClick = (event, name) => {
    window.location.pathname = `/${name}`;
  }

  render() {
    return <div>
      <AppBar
        title={this.props.title}
        iconClassNameRight="muidocs-icon-navigation-expand-more"
        onLeftIconButtonTouchTap={this.handleTouchTapMenuBtn}
      />
      <MyMenu open={this.state.menu_open} achor={this.state.menu_achor}
        touchAwayHandler={this.handleTouchTapCloseMenu}
        handleBoardAdd={this.handleBoardAdd} items={this.menu_items}/>
      <BoardDialog open={this.state.board_open} handleClose={this.handleBoardAddClose}/>
      <List>
        {this.state.list_items.map((list_item, key) => {
          return <ListItem
            onClick={event => {this.handleListClick(event, list_item.Name)}}
            key={key} primaryText={list_item.Name}
          />
        })}
      </List>
      {this.props.children}
     </div>
  }
}

export default LandingLayout;
