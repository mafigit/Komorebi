import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import ErrorStore from './store/ErrorStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {List, ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';

const label_style = {
  fontWeight: "normal"
};

export default class DodCheckDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    var dod_data = BoardStore.getStoryDodData();
    return {
      open: BoardStore.getDodCheckDialogOpen(),
      data: (dod_data ? dod_data : []),
      errors: ErrorStore.getCheckDodErrors()
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

  onChange = (comp, key, value, index) => {
    var data = this.state.data;
    if (key === "state") {
      data[index][key] = (value ? 1 : 0);
    } else {
      data[index][key] = value;
    }
    this.setState({data: data});
  }

  handleFormSubmit = () => {
    var data = this.state.data;
    BoardActions.updateStoryDod(data);
  }

  showForm = () => {
    var items = this.state.data.map((dod, key) => {
      var line = <span>{dod.name}<br />
          <TextField multiLine={true}
            hintText={"comment"}
            value={dod.comment}
            onChange={(comp, val) => {
              this.onChange(comp, "comment", val, key);}}
            key={"textfield"+key} />
        </span>;
      var check = <Checkbox key={"checkbox"+key}
        onCheck={(comp, val) => {this.onChange(comp, "state", val, key);}}
        checked={dod.state == 1} />;
      return <ListItem style={label_style} primaryText={line} key={key}
        leftCheckbox={check}
        />;
    });

    const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleFormSubmit}
      />,
    ];

    return <Dialog
        title={"Definition of Done"}
        modal={false}
        actions={actions}
        open={this.state.open}
        onRequestClose={BoardActions.closeDodCheckDialog}
        autoScrollBodyContent={true}
      >
      <List>
        {items}
      </List>
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
