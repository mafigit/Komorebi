/*jshint esversion: 6 */
import React from 'react';
import StoryShowDialog from './story_show_dialog';
import TaskShowDialog from './task_show_dialog';
import BoardStore from './store/BoardStore';
import TaskCard from './task_card';
import Column from './column';
import { Grid, Row } from 'react-bootstrap';
import Sidebar from './sidebar';

/**
 * board commponent
 */
export default class Board extends React.Component {
  /**
   * constructor
   * @param {object} props
  */
  constructor(props) {
    super(props);
    /**
     * @type {object}
     */
    this.state = this.getState();
  }

  _onChange = () => {
    this.setState(this.getState());
  }

  getState = () => {
    return {
      story_view_open: BoardStore.getStoryShowDialogOpen(),
      story_id: BoardStore.getStoryShowId(),
      task_view_open: BoardStore.getTaskShowDialogOpen(),
      task_id: BoardStore.getTaskShowId(),
      columns: BoardStore.getColumns(),
      tasks_to_display: BoardStore.getTasksToDisplay()
    };
  };

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
  }

  render() {
    var tasks_for_columns =
      Object.keys(this.state.tasks_to_display).reduce((acc, story_id) => {
        acc = acc.concat(this.state.tasks_to_display[story_id]);
        return acc;
      }, []);

    var columns = this.state.columns.map((col, key) => {
      var tasks_for_column = tasks_for_columns.reduce((acc, task, key) => {
        if (task.column_id == col.id) {
          var highlighted = false;
          if (task.id === Number(BoardStore.getHiTask())){
            highlighted = true;
          }
          acc.push(<TaskCard key={key} column_id={task.column_id}
            task_id={task.id} name={task.name} desc={task.desc}
            task_name={task.name} task_story_id={task.story_id}
            user={task.user} highlighted={highlighted} />);
        }
        return acc;
      }, []);

      return <Column key={key} name={col.name} id={col.id}
        position={col.position} max={this.state.columns.length-1} >
        {tasks_for_column}
      </Column>;
    });

    return <div className="board">
      <StoryShowDialog story_id={this.state.story_id}
        open={this.state.story_view_open} />
      <TaskShowDialog task_id={this.state.task_id}
        open={this.state.task_view_open} />
      <Grid fluid={true}>
        <Row className="show-grid">
          <Sidebar/>
          {columns}
        </Row>
      </Grid>
    </div>;
  }
}
