import React from 'react';
import {List, ListItem} from 'material-ui/List';
import BoardStore from './store/BoardStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import BoardActions from './actions/BoardActions';

export default class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      users: BoardStore.getUsers()
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
    BoardActions.fetchUsers();
  }

  handleUserClick = (event, user) => {
    event.preventDefault();
    BoardActions.toggleUserById(user.id);
  }

  render() {
    var user_components = this.state.users.map((user, key) => {
      var style =
        user.selected ? {'backgroundColor': 'rgba(0, 0, 0, 0.2)'} : {};
      return <ListItem
        className={"user_" + key}
        style={style}
        onClick={event => {this.handleUserClick(event, user);}}
        key={key} primaryText={user.name}
      />;
    });
    return <List>
      {user_components}
    </List>;
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
