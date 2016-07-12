/*jshint esversion: 6 */
import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Board from './board';
import LandingLayout from './landing_layout';
import BoardLayout from './board_layout';
import Ajax from  'basic-ajax';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "LOADING...",
      board_id: null
    }
  }

  boardLoadedHandler = (board) => {
    this.setState({board_id: board.id, title: board.name, columns: board.columns});
  }

  boardReloadHandler = () => {
    this.getBoard((board) => {
      this.setState({board_id: board.id, title: board.name, columns: board.columns});
    });
  }

  getBoard = (callback) => {
    Ajax.get(window.location.pathname, {"Accept": "application/json"}).then(response => {
      var board = JSON.parse(response.responseText);
      callback(board);
    });
  }

  render() {
    if(this.props.landing) {
      return <MuiThemeProvider>
        <LandingLayout title="Boards">
        </LandingLayout>
      </MuiThemeProvider>
    } else {
      return <MuiThemeProvider>
        <BoardLayout boardReloadHandler={this.boardReloadHandler}
          title={this.state.title} board_id={this.state.board_id}>
          <Board getBoard={this.getBoard} columns={this.state.columns} boardLoadedHandler={this.boardLoadedHandler} />
        </BoardLayout>
      </MuiThemeProvider>
    }
  }
}

var landing = window.location.pathname === "/";
ReactDOM.render(
  <App landing={landing} />,
  document.getElementById('app')
);
