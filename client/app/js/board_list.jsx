/*jshint esversion: 6 */
import React from 'react';
import ReactDOM from 'react-dom';
import BoardStore from './store/BoardStore';
import BoardActions from './actions/BoardActions';
import {List, ListItem} from 'material-ui/List';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default class BoardList extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }
  getState = () => {
    if (this.props.assign) {
      return {
        boards: BoardStore.getBoardsWithSelected()
      };
    } else {
      return {
        boards: BoardStore.getBoards()
      };
    }
  };

  _onChange = () => {
    this.setState(this.getState());
  }

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
    BoardActions.fetchBoards();
  }

  handleListClick = (event, board) => {
    if (this.props.assign) {
      BoardActions.selectBoard(board.id);
    } else {
      window.location.pathname = `/${board.name}`;
    }
  }

  onIconClickHandler = (event, id) => {
    event.stopPropagation();
    BoardActions.showConfirmation(() => {
      BoardActions.deleteBoard(id);
    });
  }

  render() {
    var boards = this.state.boards.map((board, key) => {
      var style =
        board.selected ? {'backgroundColor': 'rgba(0, 0, 0, 0.2)'} : {};
      var rightIcon = this.props.assign ? <div/> :
        <DeleteForeverIcon
          onClick={event => {this.onIconClickHandler(event, board.id);}}
        />;

      return <ListItem
        onClick={event => {this.handleListClick(event, board);}}
        key={key} primaryText={board.name}
        rightIcon={rightIcon}
        style={style}
      />;
    });

    return <List>
      {boards}
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
