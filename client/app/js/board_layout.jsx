/*jshint esversion: 6 */
import React from 'react';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import MyMenu from './menu';
import Layout from './layout';
import ColumnDialog from './column_dialog';
import StoryEditDialog from './story_edit_dialog';
import StoryFromIssueEditDialog from './story_from_issue_edit_dialog';
import TaskDialog from './task_dialog';
import Colors from './color';
import BoardStore from './store/BoardStore';

export default class BoardLayout extends Layout  {
  constructor(props) {
    super(props);
    this.state = this.getDialogState();
  }
  _onChange = () => {
    this.setState(this.getDialogState());
  }

  getDialogState = () => {
    return {
      menu_open: BoardStore.getMenuOpen(),
      column_open: BoardStore.getColumnDialogOpen(),
      story_edit_open: BoardStore.getStoryEditDialogOpen(),
      story_from_issue_edit_open: BoardStore.getStoryFromIssueEditDialogOpen(),
      task_open: BoardStore.getTaskDialogOpen()
    };
  }

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
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
        iconElementRight={
          <FlatButton label="木漏れ日" href={"/"}
            style={{verticalAlign: "baseline"}}
            labelStyle={{fontSize: "30px", color: Colors.light_red,
              fontWeight: "bold"}}/>
        }
        onLeftIconButtonTouchTap={this.handleTouchTapMenuBtn}
        style={{backgroundColor: Colors.dark_gray}} />
      <MyMenu open={this.state.menu_open} achor={this.state.menu_achor}
        touchAwayHandler={this.handleTouchTapCloseMenu} />
      <ColumnDialog open={this.state.column_open} />
      <StoryEditDialog open={this.state.story_edit_open} />
      <StoryFromIssueEditDialog open={this.state.story_from_issue_edit_open} />
      <TaskDialog open={this.state.task_open} />
      {this.props.children}
     </div>;
  }
}
