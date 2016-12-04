/*jshint esversion: 6 */
import React from 'react';
import BoardCanvas from './board_canvas';
import Ajax from 'basic-ajax';
import StoryShowDialog from './story_show_dialog';
import BoardStore from './store/BoardStore';
import TaskCard from './task_card';
import Column from './column';
import { Grid, Row } from 'react-bootstrap';
import Sidebar from './sidebar';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  _onChange = () => {
    this.setState(this.getState());
  }

  getState = () => {
    return {
      story_view_open: BoardStore.getStoryShowDialogOpen(),
      story_id: BoardStore.getStoryShowId(),
      columns: BoardStore.getColumns(),
      tasks_to_display: BoardStore.getTasksToDisplay()
    }
  }

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
  }

  updateStory = (story, column_id) => {
    let data = {
      "id": parseInt(story.id),
      "name": story.name,
      "desc": story.desc,
      "requirements": story.requirements,
      "points": story.points,
      "column_id": parseInt(column_id),
      "priority": 1
    }
    Ajax.postJson('/stories/' + story.id, data).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
       } else {
       }
    });
  }

  updateTask = (task, column_id) => {
    let data = {
      "id": parseInt(task.id),
      "name": task.name,
      "desc": task.desc,
      "column_id": parseInt(column_id),
      "priority": 1,
      "story_id": task.story_id
    }
    Ajax.postJson('/tasks/' + task.id, data).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
       } else {
       }
    });
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
          acc.push(<TaskCard key={key} name={task.name} desc={task.desc} />);
        }
        return acc;
      }, []);

      return <Column key={key} name={col.name} >
        {tasks_for_column}
      </Column>
    });

    return <div className="board">
      <StoryShowDialog story_id={this.state.story_id}
        open={this.state.story_view_open} />
      <Grid fluid={true}>
        <Row className="show-grid">
          <Sidebar/>
          {columns}
        </Row>
      </Grid>
    </div>
  }
}
