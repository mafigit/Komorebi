/*jshint esversion: 6 */
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import MyMenu from './menu';
import Layout from './layout';
import BoardDialog from './board_dialog';
import {List, ListItem} from 'material-ui/List';
import Ajax from  'basic-ajax';
import Colors from './color';
import React from 'react';

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
    ];
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

  handleBoardAddClose = () => {
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
        onLeftIconButtonTouchTap={this.handleTouchTapMenuBtn}
        iconElementRight={<FlatButton label="木漏れ日"
          href={"https://github.com/mafigit/Komorebi"}
          labelStyle={{fontSize: "30px", color: Colors.light_red,
            fontWeight: "bold"}}/>}
        style={{backgroundColor: Colors.dark_gray}}
      />
      <MyMenu open={this.state.menu_open} achor={this.state.menu_achor}
        touchAwayHandler={this.handleTouchTapCloseMenu}
        handleBoardAdd={this.handleBoardAdd} items={this.menu_items}/>
      <BoardDialog open={this.state.board_open} handleClose={this.handleBoardAddClose}/>
      <List>
        {this.state.list_items.map((list_item, key) => {
          return <ListItem
            onClick={event => {this.handleListClick(event, list_item.name);}}
            key={key} primaryText={list_item.name}
          />;
        })}
      </List>
      {this.props.children}
     </div>;
  }
}

export default LandingLayout;
