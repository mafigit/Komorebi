import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import BoardStore from './store/BoardStore';
import ErrorStore from './store/ErrorStore';
import BoardActions from './actions/BoardActions';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default class UserDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
    this.setDefaultFormValues();
  }

  getState = () => {
    return {
      error: ErrorStore.getUserErrors(),
    };
  }

  _onError = () => {
    this.setState(this.getState());
  }

  _onChange = () => {
    this.setState(this.getState());
  }

  componentWillUnmount = () => {
    ErrorStore.removeChangeListener(this._onError);
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    ErrorStore.addChangeListener(this._onError);
    BoardStore.addChangeListener(this._onChange);
  }

  setDefaultFormValues = () => {
    this.form_values = {
      name: "",
      image_path: "",
      password: ""
    };
  }

  getInputValue = (ref, type) => {
    return ReactDOM.findDOMNode(ref).querySelectorAll(type)[0].value;
  }

  handleFormSubmit = () => {
    var form_data = {
      name: this.getInputValue(this.refs.user_name, "input"),
      image_path: this.getInputValue(this.refs.user_image_path, "input"),
      password: this.getInputValue(this.refs.user_password, "input"),
    };
    BoardActions.addUser(form_data);
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
        title={"Add User"}
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={BoardActions.closeUserDialog}
        autoScrollBodyContent={true}
      >
        <br />
        <br />
        Add a name
        <br />
        <TextField ref="user_name" hintText="User Name"
          errorText={this.state.error.name}
        />
        <br />
        <br />
        Add a Image Path
        <br />
        <TextField ref="user_image_path" hintText="User Image Path"
          errorText={this.state.error.image_path}
        />
        <br />
        <br />
        Add a Password (Please note, there is no encypted connection)
        <br />
        <TextField ref="user_password" hintText="User Password"
          errorText={this.state.error.password} type="password"
        />
        <br />
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
