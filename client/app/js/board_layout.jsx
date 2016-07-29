/*jshint esversion: 6 */
import React from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import MyMenu from './menu';
import Layout from './layout';
import MenuItem from 'material-ui/MenuItem';
import StorySelect from './story_select';
import ColumnDialog from './column_dialog';
import StoryDialog from './story_dialog';
import TaskDialog from './task_dialog';
import Colors from './color';

class BoardLayout extends Layout  {
  constructor(props) {
    super(props);
    this.state = {menu_open: false, column_open: false, story_open: false, task_open: false};
    this.menu_items = [
      {
        name: "Add Task",
        handler: this.handleTaskAdd
      },
      {
        name: "Add Story",
        handler: this.handleStorydAdd
      },
      {
        name: "Add Column",
        handler: this.handleColumnAdd
      }
    ]
  }

  handleStorydAdd = () => {
    this.setState({menu_open: false, column_open: false, story_open: true, task_open: false});
  }

  handleColumnAdd = () => {
    this.setState({menu_open: false, column_open: true, story_open: false, task_open: false});
  }

  handleTaskAdd = () => {
    this.setState({menu_open: false, column_open: false, story_open: false, task_open: true});
  }

  handleTaskAddClose = (reload) => {
    if(reload) {
      this.props.boardReloadHandler();
    }
    this.setState({menu_open: false, column_open: false, story_open: false, task_open: false});
  }

  handleStoryAddClose = (reload) => {
    if(reload) {
      this.props.boardReloadHandler();
    }
    this.setState({menu_open: false, column_open: false, story_open: false, task_open: false});
  }

  handleColumnAddClose = (reload) => {
    if(reload) {
      this.props.boardReloadHandler();
    }
    this.setState({menu_open: false, column_open: false, story_open: false, task_open: false});
  }

  handleTouchTapMenuBtn = (event) => {
    event.preventDefault();
    this.setState({menu_open: true, menu_achor: event.currentTarget});
  }

  handleTouchTapCloseMenu = () => {
    var achor_element = this.state.menu_achor;
    this.setState({menu_open: false, menu_achor: achor_element});
  }

  handleFilter = (event, index, value) => {
  }

  render() {
    return <div>
      <AppBar
        title={this.props.title}
        iconElementRight={
          <div>
          <StorySelect onChange={this.handleFilter} stories={this.props.stories}
            story_id={0} allow_empty={true} style={{color: "white"}} />
          <FlatButton label="木漏れ日"
            href={"https://github.com/mafigit/Komorebi"}
            style={{verticalAlign: "baseline"}}
            labelStyle={{fontSize: "30px", color: Colors.light_red,
              fontWeight: "bold"}}/>
          </div>
        }
        onLeftIconButtonTouchTap={this.handleTouchTapMenuBtn}
        style={{backgroundColor: Colors.dark_gray}} />
      <MyMenu open={this.state.menu_open} achor={this.state.menu_achor}
        touchAwayHandler={this.handleTouchTapCloseMenu} items={this.menu_items}/>
      <ColumnDialog board_id={this.props.board_id} open={this.state.column_open}
        handleClose={this.handleColumnAddClose}/>
      <StoryDialog columns={this.props.columns}
        board_id={this.props.board_id} open={this.state.story_open}
        handleClose={this.handleStoryAddClose} action="edit"/>
      <TaskDialog tasks={this.props.tasks} columns={this.props.columns}
        board_id={this.props.board_id} open={this.state.task_open}
        stories={this.props.stories}
        handleClose={this.handleTaskAddClose}/>
      {this.props.children}
     </div>
  }
}

export default BoardLayout;
