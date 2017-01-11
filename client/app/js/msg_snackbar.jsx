/*jshint esversion: 6 */
import Snackbar from 'material-ui/Snackbar';
import React from 'react';
import MessageStore from './store/MessageStore';
import MessageActions from './actions/MessageActions';

class MsgSnackbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      message: MessageStore.getMessage(),
      open: MessageStore.getSnackbarOpen()
    };
  }

  _onMessage = () => {
    this.setState(this.getState());
  }

  handleRequestClose = () => {
    MessageActions.hideMessage();
  }

  componentWillUnmount = () => {
    MessageStore.removeChangeListener(this._onMessage);
  }

  componentDidMount = () => {
    MessageStore.addChangeListener(this._onMessage);
  }

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

export default MsgSnackbar;
