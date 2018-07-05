import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import BoardStore from './store/BoardStore';
import ErrorStore from './store/ErrorStore';
import BoardActions from './actions/BoardActions';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Checkbox from 'material-ui/Checkbox';

export default class UserDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    var user = BoardStore.getUserData();
    return {
      error: ErrorStore.getUserErrors(),
      user:  {
        name: user ? user.name : "",
        image_path: user ? user.image_path : "",
        id: user ? user.id : null,
        password: "",
        disabled: user ? user.disabled : false
      }
    };
  }

  _onError = () => {
    this.setState(this.getState());
  }

  _onChange = () => {
    this.setState(this.getState());
  }

  onChange(component, key, value) {
    var data = this.state;
    data.user[key] = value;
    this.setState(data);
  }

  componentWillUnmount = () => {
    ErrorStore.removeChangeListener(this._onError);
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    ErrorStore.addChangeListener(this._onError);
    BoardStore.addChangeListener(this._onChange);
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
    if (this.state.user.id) {
      form_data["disabled"] = this.getInputValue(this.refs.user_disabled, "input");
    }

    if (this.state.user.id) {
      BoardActions.updateUser(this.state.user);
    } else {
      BoardActions.addUser(form_data);
    }
  }

  render() {
    var title = this.state.user.id ? "Update User" : "Add User";
    var disabled = this.state.user.id ?  <Checkbox
      ref="user_disabled"
      checked={this.state.user.disabled}
      onCheck={(e, check) => { this.onChange(e, "disabled", check);}}
      label="Disabled"/> : <div></div>;
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
        title={title}
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
          value={this.state.user.name}
          onChange={(comp, val) => {this.onChange(comp, "name", val);}}
        />
        <br />
        {disabled}
        <br />
        Add a Image Path
        <br />
        <TextField ref="user_image_path" hintText="User Image Path"
          errorText={this.state.error.image_path}
          value={this.state.user.image_path}
          onChange={(comp, val) => {this.onChange(comp, "image_path", val);}}
        />
        <br />
        <br />
        Add a Password
        <br />
        <TextField ref="user_password" hintText="User Password"
          errorText={this.state.error.password} type="password"
          onChange={(comp, val) => {this.onChange(comp, "password", val);}}
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
