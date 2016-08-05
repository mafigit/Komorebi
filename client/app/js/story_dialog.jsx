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
import ReactMarkdown from 'react-markdown';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';

export default class StoryDialog extends React.Component {
  constructor(props) {
    super(props);
    if (props.action === "edit") {
      this.state = {
        story_name_error: "",
        story_desc_error: "",
        story_req_error: ""
      }
      this.setDefaultFormValues();
    } else {
      this.state = {
        story_view_values: {
          story_id: null,
          name: "",
          desc: "",
          requirements: "",
          points: ""
        }
      }
    }
  }

  componentDidUpdate = () => {
    if (this.props.action === "show") {
      if ((this.props.story_id !== null) &&
        (this.props.story_id !== this.state.story_view_values.story_id)) {

        Ajax.get(`/stories/${this.props.story_id}`,
          {"Accept": "application/json"}).then(response => {

          if(response.status == 200) {
            let fetched_story = JSON.parse(response.responseText);
            this.setState({
              story_view_values: {
                story_id: fetched_story.id,
                name: fetched_story.name,
                desc: fetched_story.desc,
                requirements: fetched_story.requirements,
                points: fetched_story.points
              }
            });
          }
        });
      }
    }
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
        BoardActions.closeStoryDialog(true);
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

  showForm = () => {
    return(
      <Dialog
        title={
          <div style={{padding: "10px", height: "40px"}}>
            <div style={{float: "left", marginLeft: "20px", marginTop: "5px"}}>
              {this.state.story_view_values.name}
            </div>
            <FloatingActionButton style={{marginRight: "20px", marginLeft: "20px", float: "right"}} ref="story_points" disabled={true} mini={true}>
              {this.state.story_view_values.points}
            </FloatingActionButton>
          </div>
        }
        modal={false}
        open={this.props.open}
        onRequestClose={BoardActions.closeStoryDialog}
        autoScrollBodyContent={true}
      >
        <br />
        Description
        <br />
        <ReactMarkdown source={this.state.story_view_values.desc}/>
        <br />
        Requirements
        <br />
        <ReactMarkdown source={this.state.story_view_values.requirements}/>
        <br />
      </Dialog>
    );
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
        onRequestClose={BoardActions.closeStoryDialog.bind(this, true)}
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
    if (this.props.action === "edit") {
      return this.editForm();
    } else {
      return this.showForm();
    }
  }
}
export default StoryDialog;
