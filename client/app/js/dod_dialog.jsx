import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import ErrorStore from './store/ErrorStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TextField from 'material-ui/TextField';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';
import {List, ListItem} from 'material-ui/List';

export default class DodDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
    this.state.new_dod = "";
  }

  getState = () => {
    var dod_data = BoardStore.getDodData();
    return {
      open: BoardStore.getShowDodDialog(),
      data: (dod_data ? dod_data.dods : []),
      errors: ErrorStore.getDodErrors()
    };
  }

  _onChange = () => {
    this.setState(this.getState());
  }

  _onError = () => {
    this.setState(this.getState());
  }

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
    ErrorStore.removeChangeListener(this._onError);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
    ErrorStore.addChangeListener(this._onError);
  }

  onChange = (comp, key, value) => {
    this.setState({new_dod: value});
  }

  handleAdd = () => {
    var dods = new Object(this.state.data);
    if (this.state.new_dod === "") {
      return;
    }
    dods.push(this.state.new_dod);
    this.setState({new_dod: ""});
    BoardActions.updateDods(dods);
  }

  handleDelete = (index) => {
    var dods = new Object(this.state.data);
    if (index > -1) {
      dods.splice(index, 1);
    }
    this.setState({new_dod: ""});
    BoardActions.updateDods(dods);
  }

  showForm = () => {
    var items = this.state.data.map((dod, key) => {
      return <ListItem primaryText={dod} key={key}
        rightIcon={<DeleteForeverIcon onTouchTap={
          () => {this.handleDelete(key);}} /> }
        />;
    });

    return <Dialog
        title={"Definition of Done"}
        modal={false}
        open={this.state.open}
        onRequestClose={BoardActions.closeDodDialog}
        autoScrollBodyContent={true}
      >
      <List>
        {items}
      </List>
      <TextField ref="dod_name"
        hintText="Add to Definition of Done"
        value={this.state.new_dod}
        errorText={this.state.errors.dods}
        onChange={(comp, val) => {this.onChange(comp, "new_dod", val);}}
      />
      <FlatButton
        label="Add"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleAdd}
      />
      </Dialog>;
  }

  render() {
    return this.showForm();
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
