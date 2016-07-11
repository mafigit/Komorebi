/*jshint esversion: 6 */
import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Board from './board';
import Layout from './layout';

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
    return <MuiThemeProvider>
      <Layout title={this.state.title}>
        <Board boardLoadedHandler={this.boardLoadedHandler} />
      </Layout>
    </MuiThemeProvider>
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
