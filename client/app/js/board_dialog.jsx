import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import TextField from 'material-ui/TextField';
import Ajax from  'basic-ajax';
import ReactDOM from 'react-dom';

export default class BoardDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      board_name_error: ""
    }
  }
  handleFormSubmit = () => {
    var board_name =
      ReactDOM.findDOMNode(this.refs.board_name).querySelectorAll("input")[0].value;
    Ajax.postJson('/boards', {"name": board_name}).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        this.handleClose();
      } else {
        this.setState({board_name_error: response_obj.message});
      }
    });
  }

  handleClose = () => {
    this.setState({board_name_error: ""});
    this.props.handleClose();
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
        title="Add New Board"
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={this.handleClose}
      >
        Add a name for the new Board
        <br />
        <TextField ref="board_name" hintText="Board Name"
          errorText={this.state.board_name_error} />
        <br />
      </Dialog>
    );
  }
}
export default BoardDialog;
