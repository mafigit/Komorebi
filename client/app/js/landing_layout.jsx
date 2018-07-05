/*jshint esversion: 6 */
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton'; import MyMenu from './menu';
import Layout from './layout';
import BoardDialog from './board_dialog';
import Colors from './color';
import React from 'react';
import BoardStore from './store/BoardStore';
import BoardActions from './actions/BoardActions';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MsgSnackbar from './msg_snackbar';
import BoardList from './board_list';
import UserAssign from './user_assign';
import UserManage from './user_manage';
import UserLogin from './user_login';

class LandingLayout extends Layout  {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      list_items: BoardStore.getBoards(),
      menu_open: false,
      board_open: BoardStore.getBoardDialogOpen(),
      show_user_assign: BoardStore.getShowUserAssign(),
      show_user_manage: BoardStore.getShowUserManage()
    };
  }

  _onChange = () => {
    this.setState(this.getState());
  };

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
  }

  handleTouchTapMenuBtn = (event) => {
    event.preventDefault();
    this.setState({menu_open: true, menu_achor: event.currentTarget});
  }

  handleTouchTapCloseMenu = () => {
    var achor_element = this.state.menu_achor;
    this.setState({menu_open: false, menu_achor: achor_element});
  }

  handleBoardDialogClose = () => {
    BoardActions.closeBoardDialog();
    BoardActions.fetchBoards();
  }


  render() {
    var content, site_title;
    if (this.state.show_user_assign) {
      content = <UserAssign />;
      site_title = "User Assign";
    } else if (this.state.show_user_manage) {
      content = <UserManage />;
      site_title = "Manage Users";
    } else {
      content = <BoardList />;
      site_title = this.props.title;
    }
    return <div>
      <AppBar
        title={site_title}
        onLeftIconButtonTouchTap={this.handleTouchTapMenuBtn}
        iconElementRight={<FlatButton label="木漏れ日"
          href={"https://github.com/mafigit/Komorebi"}
          labelStyle={{fontSize: "30px", color: Colors.light_red,
            fontWeight: "bold"}}/>}
        style={{backgroundColor: Colors.dark_gray}}
      />
      <MyMenu open={this.state.menu_open} achor={this.state.menu_achor}
        touchAwayHandler={this.handleTouchTapCloseMenu}
        landing={true}/>
      <BoardDialog open={this.state.board_open}
        handleClose={this.handleBoardDialogClose}
      />
      {content}
      <UserLogin />
      {this.props.children}
      <MsgSnackbar/>
     </div>;
  }

  // This is needed for testing the a component without the whole app context
  static childContextTypes = {
    muiTheme: React.PropTypes.object
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme()
    };
  }

}
export default LandingLayout;
