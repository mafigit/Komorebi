/*jshint esversion: 6 */
import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Board from './board';
import LandingLayout from './landing_layout';
import BoardLayout from './board_layout';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "LOADING..."
    }
  }
  boardLoadedHandler = (board) => {
    this.setState({title: board.name});
  }

  render() {
    if(this.props.landing) {
      return <MuiThemeProvider>
        <LandingLayout title="Boards">
        </LandingLayout>
      </MuiThemeProvider>
    } else {
      return <MuiThemeProvider>
        <BoardLayout title={this.state.title}>
          <Board boardLoadedHandler={this.boardLoadedHandler} />
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
