import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import StorySelect from './story_select';
import BoardStore from './store/BoardStore';
import ErrorStore from './store/ErrorStore';
import BoardActions from './actions/BoardActions';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default class TaskDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
    this.setDefaultFormValues();
  }

  getState = () => {
    return {
      error: ErrorStore.getTaskErrors(),
      last_sel_story_id: BoardStore.getSelectedStoryId()
    };
  }

  _onError = () => {
    this.setState(this.getState());
  }

  _onChange = () => {
    this.setState(this.getState());
  }

  componentWillUnmount = () => {
    ErrorStore.removeChangeListener(this._onError);
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    ErrorStore.addChangeListener(this._onError);
    BoardStore.addChangeListener(this._onChange);
  }

  setDefaultFormValues = () => {
    this.form_values = {
      name: "",
      desc: "",
      story_id: null,
      column_id: null,
    };
  }

  getInputValue = (ref, type) => {
    return ReactDOM.findDOMNode(ref).querySelectorAll(type)[0].value;
  }

  handleFormSubmit = () => {
    var form_data = {
      name: this.getInputValue(this.refs.task_name, "input"),
      desc: this.getInputValue(this.refs.task_desc, "textarea"),
      story_id: BoardStore.getSelectedStoryId(),
      column_id: BoardStore.getFirstColumn().id,
    };
    BoardActions.addTask(form_data);
  }

  handleStoryIdChange = (event, index, value) => {
    BoardActions.updateSelectedStoryId(value);
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
          errorText={this.state.error.name} />
        <br />
        <br />
        Add a Description
        <br />
        <TextField ref="task_desc"
          hintText="Task Description"
          errorText={this.state.error.desc}
          multiLine={true}
          fullWidth={true}
        />
        <br />
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
