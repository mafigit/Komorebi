import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import TextField from 'material-ui/TextField';
import Ajax from  'basic-ajax';
import ReactDOM from 'react-dom';

export default class ColumnDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      column_name_error: ""
    }
  }
  handleFormSubmit = () => {
    var column_name =
      ReactDOM.findDOMNode(this.refs.column_name).querySelectorAll("input")[0].value;
    Ajax.postJson('/columns', {"name": column_name,
      "board_id": this.props.board_id }).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        this.handleClose(true);
      } else {
        this.setState({column_name_error: response_obj.message});
      }
    });
  }

  handleClose = (reload_board) => {
    this.setState({column_name_error: ""});
    this.props.handleClose(reload_board);
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
        onRequestClose={this.handleClose}
      >
        Add a name for the new Column
        <br />
        <TextField ref="column_name" hintText="Column Name"
          errorText={this.state.column_name_error} />
        <br />
      </Dialog>
    );
  }
}
export default ColumnDialog;
