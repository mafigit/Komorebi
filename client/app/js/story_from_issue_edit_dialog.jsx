import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import BoardActions from './actions/BoardActions';
import ErrorStore from './store/ErrorStore';

export default class StoryFromIssueEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
    this.setDefaultFormValues();
  }

  getState = () => {
    return {
      error: ErrorStore.getStoryIssueErrors()
    };
  }

  _onError = () => {
    this.setState(this.getState());
  }

  setDefaultFormValues = () => {
    this.form_values = {
      issue: ""
    };
  }

  componentWillUnmount = () => {
    ErrorStore.removeChangeListener(this._onError);
  }

  componentDidMount = () => {
    ErrorStore.addChangeListener(this._onError);
  }

  getInputValue = (ref, type) => {
    return ReactDOM.findDOMNode(ref).querySelectorAll(type)[0].value;
  }

  handleFormSubmit = () => {
    this.form_values.issue = this.getInputValue(this.refs.issue, "input");
    BoardActions.addStoryFromIssue(this.form_values);
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
        <TextField ref="issue" hintText="Issue Nr"
          errorText={this.state.error.issue} />
        <br />
        <br />
      </Dialog>
    );
  }

  render() {
    return this.editForm();
  }
}
