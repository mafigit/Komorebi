import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import StoryPointPicker from './story_point_picker';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import ErrorActions from './actions/ErrorActions';
import ErrorStore from './store/ErrorStore';

export default class StoryEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
    this.setDefaultFormValues();
  }

  getState = () => {
    return {
      error: ErrorStore.getStoryErrors()
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

  setDefaultFormValues = () => {
    this.form_values = {
      name: "",
      desc: "",
      points: 0,
      priority: 1,
      requirements: "",
      column_id: ""
    };
  }

  getInputValue = (ref, type) => {
    return ReactDOM.findDOMNode(ref).querySelectorAll(type)[0].value;
  }

  handleFormSubmit = () => {
    this.form_values.name = this.getInputValue(this.refs.story_name, "input");
    this.form_values.desc = this.getInputValue(this.refs.story_desc, "textarea");
    this.form_values.requirements = this.getInputValue(this.refs.story_req, "textarea");
    this.form_values.board_id = BoardStore.getBoardId();
    var column = BoardStore.getFirstColumn();
    if (!column) {
      ErrorActions.addStoryErrors({name:
        "No column found. Add column first." });
      return;
    }
    this.form_values.column_id = column.id;

    BoardActions.addStory(this.form_values);
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
          errorText={this.state.error.name} />
        <br />
        <br />
        Add a Description
        <br />
        <TextField ref="story_desc"
          hintText="Story Description"
          errorText={this.state.error.desc}
          multiLine={true}
          fullWidth={true}
        />
        <br />
        <br />
        Add Requirements
        <br />
        <TextField ref="story_req"
          hintText="Story Requirements"
          errorText={this.state.error.req}
          multiLine={true}
          fullWidth={true}
        />
        <br />
      </Dialog>
    );
  }

  render() {
    return this.editForm();
  }
}
