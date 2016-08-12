import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import TextField from 'material-ui/TextField';
import Ajax from  'basic-ajax';
import ReactDOM from 'react-dom';
import MenuItem from 'material-ui/MenuItem';
import StoryPointPicker from './story_point_picker';
import StorySelect from './story_select';
import BoardStore from './store/BoardStore';
import BoardActions from './actions/BoardActions';

export default class TaskDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      task_name_error: "",
      task_desc_error: "",
      last_sel_story_id: null
    }
    this.setDefaultFormValues();
  }

  setDefaultFormValues = () => {
    this.form_values = {
      name: "",
      desc: "",
      story_id: null,
      column_id: null,
      priority: 1
    }
  }

  getInputValue = (ref, type) => {
    return ReactDOM.findDOMNode(ref).querySelectorAll(type)[0].value;
  }

  handleFormSubmit = () => {
    this.form_values.name = this.getInputValue(this.refs.task_name, "input");
    this.form_values.desc = this.getInputValue(this.refs.task_desc, "textarea");
    this.form_values.story_id = this.state.last_sel_story_id;
    this.form_values.column_id = BoardStore.getFirstColumn().id;

    Ajax.postJson('/tasks', this.form_values).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        BoardActions.closeTaskDialog(true);
      } else {
        this.setState({
          task_name_error: response_obj.message,
          task_desc_error: response_obj.message,
        });
      }
   });
  }

  handleStoryIdChange = (event, index, value) => {
    this.setState({last_sel_story_id: value});
  }

  valueHandler = (value) => {
    this.form_values.points = value;
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
        title={"Add Task"}
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={BoardActions.closeTaskDialog}
        autoScrollBodyContent={true}
      >
        <br />
        Select Story
        <br />
        <StorySelect onChange={this.handleStoryIdChange}
          story_id={this.state.last_sel_story_id}
        />
        <br />
        <br />
        Add a name
        <br />
        <TextField ref="task_name" hintText="Task Name"
          errorText={this.state.task_name_error} />
        <br />
        <br />
        Add a Description
        <br />
        <TextField ref="task_desc"
          hintText="Task Description"
          errorText={this.state.task_desc_error}
          multiLine={true}
          fullWidth={true}
        />
        <br />
        <br />
      </Dialog>
    );
  }
}
export default TaskDialog;
