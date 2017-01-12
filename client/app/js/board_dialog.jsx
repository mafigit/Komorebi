import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import BoardActions from './actions/BoardActions';
import ErrorStore from './store/ErrorStore';
import BoardStore from './store/BoardStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import Checkbox from 'material-ui/Checkbox';

const label_style = {
  fontWeight: "normal"
};

const default_form = {
  name: "",
  private: false
};

export default class BoardDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState(default_form);
  }

  getState = (form_values) => {
    var new_state = {
      error: ErrorStore.getBoardErrors(),
      board: BoardStore.getBoard()
    };

    if (new_state.board) {
      new_state.form_values = new_state.board;
    } else if (form_values) {
      new_state.form_values = form_values;
    }
    return new_state;
  }

  _onError = () => {
    this.setState(this.getState());
  }

  _onChange = () => {
    var board = BoardStore.getBorad();
    if (board && board !== this.state.board) {
      this.setState(this.getState(board));
    } else if (!board) {
      this.setDefaultFormValues();
    }
    this.setState(this.getState());
  }

  setDefaultFormValues = () => {
    this.setState({form_values: default_form});
  }

  componentWillUnmount = () => {
    ErrorStore.removeChangeListener(this._onError);
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    ErrorStore.addChangeListener(this._onError);
    BoardStore.removeChangeListener(this._onChange);
  }

  handleFormSubmit = () => {
    BoardActions.addBoard(this.state.form_values);
  }

  handleClose = () => {
    this.setState({error: ""});
    this.props.handleClose();
  }

  onChange(component, key, value) {
    var form_values = this.state.form_values;
    form_values[key] = value;
    this.setState({form_values: form_values});
  }

  onChecked(event, isInputChecked) {
    var form_values = this.state.form_values;
    form_values.private = isInputChecked;
    this.setState({form_values: form_values});
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
        <TextField ref="board_name"
          hintText="Board Name"
          value={this.state.form_values.name}
          onChange={(comp, val) =>
            {this.onChange(comp, "name", val);}}
          errorText={this.state.error.name} />
        <br />
        <br />
        Public or Private?
        <br />
        <Checkbox
          ref="private"
          checked={this.state.form_values.private}
          checkedIcon={<VisibilityOff />}
          uncheckedIcon={< Visibility />}
          onCheck={(e, check) => { this.onChecked(e, check);}}
          labelStyle={label_style}
          label={this.state.form_values.private ? "Private" : "Public"}
        />
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
