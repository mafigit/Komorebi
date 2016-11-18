/*jshint esversion: 6 */
import React from 'react';
import BoardCanvas from './board_canvas';
import Ajax from 'basic-ajax';
import StoryShowDialog from './story_show_dialog';
import BoardStore from './store/BoardStore';
import StoryCard from './story_card';
import TaskCard from './task_card';
import Column from './column';
import { Grid, Row } from 'react-bootstrap';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      story_view_open: BoardStore.getStoryShowDialogOpen(),
      story_id: BoardStore.getStoryShowId()
    }
  }

  _onChange = () => {
    this.setState({
      story_view_open: BoardStore.getStoryShowDialogOpen(),
      story_id: BoardStore.getStoryShowId()
    });
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

  componentDidUpdate() {
    //  this.board_canvas =
    //    new BoardCanvas('board', {story: this.updateStory, task: this.updateTask });
  }

  getStoriesForColumn = (column_id) => {
    return this.props.stories.filter((story) => {
      return story.column_id == column_id;
    });
  }

  render() {
    var columns = this.props.columns.map((col, key) => {
      var story_cards = this.getStoriesForColumn(col.id).map((story, key) => {
        return <StoryCard key={key} name={story.name} />
      });
      return <Column key={key} name={col.name} >
       {story_cards}
      </Column>
    });

    return <div className="board">
      <StoryShowDialog story_id={this.state.story_id}
        open={this.state.story_view_open} />
      <Grid fluid={true}>
        <Row className="show-grid">
          {columns}
        </Row>
      </Grid>

    </div>
  }
}
