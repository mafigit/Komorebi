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
    return {
      boards: BoardStore.getBoards()
    };
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

  handleListClick = (event, name) => {
    window.location.pathname = `/${name}`;
  }

  onIconClickHandler = (event, id) => {
    event.stopPropagation();
    BoardActions.deleteBoard(id);
  }

  render() {
    return <List>
      {this.state.boards.map((board, key) => {
        return <ListItem
          onClick={event => {this.handleListClick(event, board.name);}}
          key={key} primaryText={board.name}
          rightIcon={ <DeleteForeverIcon onClick={event =>
            {this.onIconClickHandler(event, board.id);}}/> }
        />;
      })}
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
