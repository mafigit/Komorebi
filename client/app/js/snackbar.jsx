/*jshint esversion: 6 */
import Snackbar from 'material-ui/Snackbar';
import React from 'react';

class MySnackbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      message: "",
      ws: undefined,
      boardName: this.props.boardName,
    };
  }

  show_message = () => {
    this.setState({
      open: true,
      message: "Board Updated",
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
    this.boardReloadHandler();
  };

  boardReloadHandler = () => {
    this.props.boardReloadHandler();
  };

  update_websocket = (board_name) => {
    if (board_name.charAt(0) != "/") {
      board_name = "/" + board_name;
    }
    var port = (location.port ? ':' + location.port : '')
    var uri = window.location.hostname + port;
    var socket = new WebSocket("ws://" + uri + board_name + "/ws");
    socket.onmessage = this.show_message;
    this.setState({
      boardName: board_name,
      ws: socket,
    });
  };

  componentDidUpdate() {
    var current_board = window.location.pathname;
    if (this.state.boardName != current_board) {
      this.update_websocket(current_board);
    }
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

export default MySnackbar;
