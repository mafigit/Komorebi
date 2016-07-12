/*jshint esversion: 6 */
import React from 'react';
import BoardCanvas from './board_canvas';

class Board extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.getBoard((board) => {
      this.props.boardLoadedHandler(board)
    });
  }

  componentDidUpdate() {
    this.board_canvas = new BoardCanvas('board', this.props.columns);
  }

  render() {
    return <div id='board'></div>;
  }
}

export default Board;
