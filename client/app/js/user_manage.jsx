import React from 'react';
import {List, ListItem} from 'material-ui/List';
import BoardStore from './store/BoardStore';
import IconButton from 'material-ui/IconButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import BoardActions from './actions/BoardActions';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import UserDialog from './user_dialog';
import {grey400} from 'material-ui/styles/colors';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';

export default class UserManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      user_open: BoardStore.getUserDialogOpen(),
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

  onDeleteIconClickHandler = (event, user_id) => {
    event.stopPropagation();
    BoardActions.showConfirmation(() => {
      BoardActions.deleteUser(user_id);
    });
  }

  handleUserClick = (event, user) => {
    event.preventDefault();
    BoardActions.openUserDialog(user);
  }

  handleUserAdd = (event) => {
    event.preventDefault();
    BoardActions.openUserDialog();
  }

  handleUserDialogClose = () => {
    BoardActions.closeUserDialog();
    BoardActions.fetchBoards();
  }

  render() {
    var user_components = this.state.users.map((user, key) => {
      var rightIcon = <DeleteForeverIcon
          onClick={event => {this.onDeleteIconClickHandler(event, user.id);}}
        />;
      return <ListItem
        className={"user_" + key}
        onClick={event => {this.handleUserClick(event, user);}}
        rightIcon={rightIcon}
        key={key} primaryText={user.name}
      />;
    });
    return <div>
      <br />
      <h4> Add User</h4>
      <IconButton tooltip="Add User"
        onClick={event => {this.handleUserAdd(event);}}>
        <AddIcon color={grey400} />
      </IconButton>

      <br />
      <br />

      <h4> Users </h4>
      <List>
        {user_components}
      </List>
      <UserDialog open={this.state.user_open}
        handleClose={this.handleUserDialogClose}
      />
    </div>;
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
