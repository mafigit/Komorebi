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
      board_id: null,
      columns: [],
      stories: []
    }
  }

  boardLoadedHandler = (board) => {
    this.getStories((stories) => {
      this.setState({board_id: board.id, title: board.name, columns: board.columns, stories: stories});
    })
  }

  boardReloadHandler = () => {
    this.getBoard((board) => {
      this.getStories((stories) => {
        this.setState({board_id: board.id, title: board.name, columns: board.columns, stories: stories});
      })
    });
  }

  getStories = (callback) => {
    Ajax.get(window.location.pathname + "/stories", {"Accept": "application/json"}).then(response => {
      var stories = [];
      if(response.status == 200) {
        stories = JSON.parse(response.responseText);
      }
      callback(stories);
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
          title={this.state.title} board_id={this.state.board_id} columns={this.state.columns}>
          <Board getBoard={this.getBoard} columns={this.state.columns} stories={this.state.stories} boardLoadedHandler={this.boardLoadedHandler} />
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
