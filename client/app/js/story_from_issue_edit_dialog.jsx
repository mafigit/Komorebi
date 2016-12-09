import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import TextField from 'material-ui/TextField';
import Ajax from  'basic-ajax';
import ReactDOM from 'react-dom';
import StoryPointPicker from './story_point_picker';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';

export default class StoryFromIssueEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      issue_error: "",
    }
    this.setDefaultFormValues();
  }

  setDefaultFormValues = () => {
    this.form_values = {
      issue: "",
      column_id: "",
    }
  }

  getInputValue = (ref, type) => {
    return ReactDOM.findDOMNode(ref).querySelectorAll(type)[0].value;
  }

  handleFormSubmit = () => {
    this.form_values.issue = this.getInputValue(this.refs.issue_nr, "input");
    this.form_values.column_id = BoardStore.getFirstColumn().id;

    Ajax.getJson(`/create_story_by_issue/${this.form_values.column_id}/${this.form_values.issue}`).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        BoardActions.closeStoryFromIssueEditDialog(true);
      } else {
        this.setState({
          issue_error: response_obj.message,
        });
      }
   });
  }

  editForm = () => {
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
        title="Add Story from Issue"
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={BoardActions.closeStoryFromIssueEditDialog.bind(this, true)}
        autoScrollBodyContent={true}
      >
        <br />
        Issue Nr. from features.genua.de
        <br />
        <TextField ref="issue_nr" hintText="Issue Nr"
          errorText={this.state.issue_error} />
        <br />
        <br />
      </Dialog>
    )
  }

  render() {
    return this.editForm();
  }
}
