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
      stories: [],
      tasks: [],
    }
  }

  componentDidMount = () => {
    window.onresize = (event) => {
      this.boardReloadHandler();
    };
  }

  boardLoadedHandler = (board) => {
    this.getStories((stories, tasks) => {
    this.setState({board_id: board.id, title: board.name,
      columns: board.columns, stories: stories, tasks: tasks});
    })
  }

  boardReloadHandler = () => {
    this.getBoard((board) => {
      this.getStories((stories, tasks) => {
        this.setState({board_id: board.id, title: board.name,
          columns: board.columns, stories: stories, tasks: tasks});
      })
    });
  }

  setFilterHandler = () => {
  }

  getStories = (callback) => {
    Ajax.get(window.location.pathname + "/stories", {"Accept": "application/json"}).then(response => {
      var stories = [];
      if(response.status == 200) {
        stories = JSON.parse(response.responseText);
        this.getTasks(stories, callback);
      }
    });
  }

  getTasks = (stories, callback) => {
    var ajax_count = stories.length;
    var tasks = [];
    if (ajax_count == 0) {
      callback(stories, tasks);
    }
    stories.forEach(function(story) {
      Ajax.get(`/stories/${story.id}/tasks`,
        {"Accept": "application/json"}).then(response => {
        if(response.status == 200) {
          let fetched_tasks = JSON.parse(response.responseText);
          tasks.push({story_id: story.id, tasks: fetched_tasks});
          ajax_count--;
          if (ajax_count == 0) {
            callback(stories, tasks);
          }
        }
      });
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
        <BoardLayout boardReloadHandler={this.boardReloadHandler} stories={this.state.stories}
          title={this.state.title} board_id={this.state.board_id} columns={this.state.columns}>
          <Board boardReloadHandler={this.boardReloadHandler}
            getBoard={this.getBoard} columns={this.state.columns}
            stories={this.state.stories}
            tasks={this.state.tasks}
            boardLoadedHandler={this.boardLoadedHandler}
          />
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
