/*jshint esversion: 6 */
import React from 'react';
import BoardCanvas from './board_canvas';
import Ajax from 'basic-ajax';

class Board extends React.Component {
  constructor(props) {
    super(props);
  }

  updateStory = (story, column) => {
    let data = {
      "id": parseInt(story.id),
      "name": story.name,
      "desc": story.desc,
      "requirements": story.requirements,
      "points": story.points,
      "column_id": parseInt(column.id)
    }
    Ajax.postJson('/stories/' + story.id, data).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
       } else {
       }
    });
  }

  componentDidMount() {
    this.props.getBoard((board) => {
      this.props.boardLoadedHandler(board)
    });
  }

  componentDidUpdate() {
    this.board_canvas =
      new BoardCanvas('board', this.props.columns, this.props.stories, {story: this.updateStory});
  }

  render() {
    return <div id='board'></div>;
  }
}

export default Board;
