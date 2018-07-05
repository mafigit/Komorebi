import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import BoardStore from './store/BoardStore';
import BoardActions from './actions/BoardActions';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default class UserLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      open: BoardStore.getShowLogin(),
      user: {
        name: "",
        password: "",
      }
    };
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
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
  }

  handleFormSubmit = () => {
    BoardActions.loginUser(this.state.user);
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
        title="Login"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={BoardActions.closeLogin}
        autoScrollBodyContent={true}
      >
        <br />
        <br />
        Name
        <br />
        <TextField ref="user_name" hintText="User Name"
          onChange={(comp, val) => {this.onChange(comp, "name", val);}}
        />
        <br />
        <br />
        Password
        <br />
        <TextField ref="user_password" hintText="User Password" type="password"
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
