/*jshint esversion: 6 */
import Ajax from  'basic-ajax';
import React from 'react';
import BoardCanvas from './board_canvas';

class Board extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    Ajax.get('/gz', {"Accept": "application/json"}).then(function(response) {
      var board = JSON.parse(response.responseText);
      this.props.boardLoadedHandler(board);
      //XXX: Mocked data will be removed later
      var board_canvas = new BoardCanvas('board', [1,2,3]);
    }.bind(this));
  }

  render() {
    return <div id='board'></div>;
  }
}

export default Board;
