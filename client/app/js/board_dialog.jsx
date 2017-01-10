import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import BoardActions from './actions/BoardActions';
import ErrorStore from './store/ErrorStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default class BoardDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      error: ErrorStore.getBoardErrors()
    };
  }

  _onError = () => {
    this.setState(this.getState());
  }

  componentWillUnmount = () => {
    ErrorStore.removeChangeListener(this._onError);
  }

  componentDidMount = () => {
    ErrorStore.addChangeListener(this._onError);
  }

  handleFormSubmit = () => {
    var board_name =
      ReactDOM.findDOMNode(this.refs.board_name).querySelectorAll("input")[0].value;
    BoardActions.addBoard({"name": board_name});
  }

  handleClose = () => {
    this.setState({error: ""});
    this.props.handleClose();
  }

  render() {
    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleFormSubmit}
      />,
    ];

    return (
      <Dialog
        title="Add New Board"
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={this.handleClose}
      >
        Add a name for the new Board
        <br />
        <TextField ref="board_name" hintText="Board Name"
          errorText={this.state.error.board_name} />
        <br />
      </Dialog>
    );
  }
  static childContextTypes = {
    muiTheme: React.PropTypes.object
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme()
    };
  }
}
