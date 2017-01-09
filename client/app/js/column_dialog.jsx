import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Ajax from  'basic-ajax';
import ReactDOM from 'react-dom';
import BoardStore from './store/BoardStore';
import BoardActions from './actions/BoardActions';

export default class ColumnDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      column_name_error: ""
    };
  }
  handleFormSubmit = () => {
    var column_name =
      ReactDOM.findDOMNode(this.refs.column_name).querySelectorAll("input")[0].value;
    var data = {"name": column_name, "board_id": BoardStore.getBoardId()};
    Ajax.postJson('/columns', data).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        BoardActions.closeColumnDialog(true);
      } else {
        this.setState({column_name_error: response_obj.message});
      }
    });
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
          errorText={this.state.column_name_error} />
        <br />
      </Dialog>
    );
  }
}
