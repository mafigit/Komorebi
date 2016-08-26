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

export default class StoryEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      story_name_error: "",
      story_desc_error: "",
      story_req_error: ""
    }
    this.setDefaultFormValues();
  }

  setDefaultFormValues = () => {
    this.form_values = {
      name: "",
      desc: "",
      points: 0,
      priority: 1,
      requirements: "",
      column_id: "",
      priority: 1
    }
  }

  getInputValue = (ref, type) => {
    return ReactDOM.findDOMNode(ref).querySelectorAll(type)[0].value;
  }

  handleFormSubmit = () => {
    this.form_values.name = this.getInputValue(this.refs.story_name, "input");
    this.form_values.desc = this.getInputValue(this.refs.story_desc, "textarea");
    this.form_values.requirements = this.getInputValue(this.refs.story_req, "textarea");
    this.form_values.column_id = BoardStore.getFirstColumn().id;

    Ajax.postJson('/stories', this.form_values).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        BoardActions.closeStoryEditDialog(true);
      } else {
        this.setState({
          story_name_error: response_obj.message,
          story_desc_error: response_obj.message,
          story_req_error: response_obj.message
        });
      }
   });
  }

  pointsHandler = (value) => {
    this.form_values.points = value;
  }

  priorityHandler = (value) => {
    this.form_values.priority = value;
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
        title="Add Story"
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={BoardActions.closeStoryEditDialog.bind(this, true)}
        autoScrollBodyContent={true}
      >
         <StoryPointPicker title="Points" key='0' valueHandler={this.pointsHandler}/>
         <StoryPointPicker title="Priority" key='1' valueHandler={this.priorityHandler}
         range={[1,2,3,4,5,6,7,8,9,10]}/>
        <br />
        Add a name
        <br />
        <TextField ref="story_name" hintText="Story Name"
          errorText={this.state.story_name_error} />
        <br />
        <br />
        Add a Description
        <br />
        <TextField ref="story_desc"
          hintText="Story Description"
          errorText={this.state.story_desc_error}
          multiLine={true}
          fullWidth={true}
        />
        <br />
        <br />
        Add Requirements
        <br />
        <TextField ref="story_req"
          hintText="Story Requirements"
          errorText={this.state.story_req_error}
          multiLine={true}
          fullWidth={true}
        />
        <br />
      </Dialog>
    )
  }

  render() {
    return this.editForm();
  }
}
export default StoryEditDialog;
