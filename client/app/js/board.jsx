/*jshint esversion: 6 */
import React from 'react';
import BoardCanvas from './board_canvas';
import Ajax from  'basic-ajax';

class Board extends React.Component {
  constructor(props) {
    super(props);
  }

  updateStory = (story, column) => {
    Ajax.postJson('/stories/' + story._id , {"id": parseInt(story._id), "column_id": parseInt(column._id)}).then(response => {
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
