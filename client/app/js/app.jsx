/*jshint esversion: 6 */
import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Board from './board';
import LandingLayout from './landing_layout';
import BoardLayout from './board_layout';
import MySnackbar from './snackbar';
import BoardStore from './store/BoardStore';
import BoardActions from './actions/BoardActions';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getBoardState();
  }

  getBoardState = () => {
    return {
      board_id: BoardStore.getBoardId(),
      board_title: BoardStore.getBoardTitle(),
      columns: BoardStore.getColumns(),
      stories: BoardStore.getStories(),
      tasks: BoardStore.getTasks()
    };
  };

  _onChange = () => {
    this.setState(this.getBoardState());
  }

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
    if(!this.props.landing) {
      BoardActions.fetchAll();
    }
  }

  setFilterHandler = () => {
  }

  render() {
    if(this.props.landing) {
      return <MuiThemeProvider>
        <LandingLayout title="Boards">
        </LandingLayout>
      </MuiThemeProvider>;
    } else {
      return <MuiThemeProvider>
        <BoardLayout stories={this.state.stories} title={this.state.board_title}
          board_id={this.state.board_id} >
          <Board />
          <MySnackbar boardName={this.state.title} />
        </BoardLayout>
      </MuiThemeProvider>;
    }
  }
}

var landing = window.location.pathname === "/";
ReactDOM.render(
  <App landing={landing} />,
  document.getElementById('app')
);
