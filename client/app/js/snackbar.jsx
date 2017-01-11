/*jshint esversion: 6 */
import Snackbar from 'material-ui/Snackbar';
import React from 'react';
import BoardStore from './store/BoardStore';
import BoardActions from './actions/BoardActions';

class MySnackbar extends React.Component {

  constructor(props) {
    super(props);
    this.state =  this.getState();
  }

  getState = () => {
    return {
      open: BoardStore.getShowMessage(),
      message: BoardStore.getMessage()
    };
  }

  _onChange = () => {
    this.setState(this.getState());
  }
  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
  }

  handleRequestClose = () => {
    BoardActions.closeMessage();
  };

  render() {
    return (
      <div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={2000}
          onRequestClose={this.handleRequestClose}
        />
      </div>
    );
  }
}

export default MySnackbar;
