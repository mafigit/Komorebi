import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import BoardActions from './actions/BoardActions';
import ErrorStore from './store/ErrorStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default class ColumnDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      error: ErrorStore.getColumnErrors()
    };
  }
  _onError = () => {
    this.setState(this.getState());
  }
  componentWillUnmount = () => {
    ErrorStore.removeChangeListener(this._onError);
  }
  componentDidMount = () => {
    ErrorStore.addChangeListener(this._onError);
  }

  handleFormSubmit = () => {
    var column_name =
      ReactDOM.findDOMNode(this.refs.column_name).querySelectorAll("input")[0].value;
    BoardActions.addColumn(column_name);
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
        title="Add New Column"
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={BoardActions.closeColumnDialog}
      >
        Add a name for the new Column
        <br />
        <TextField ref="column_name" hintText="Column Name"
          errorText={this.state.error.name} />
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
