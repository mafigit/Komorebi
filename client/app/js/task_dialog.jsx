import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import StorySelect from './story_select';
import UserSelect from './user_select';
import BoardStore from './store/BoardStore';
import ErrorStore from './store/ErrorStore';
import BoardActions from './actions/BoardActions';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const default_form_values = {
  name: "",
  desc: "",
  story_id: null,
  column_id: null,
};

export default class TaskDialog extends React.Component {
  constructor(props) {
    super(props);
    var new_form_values = JSON.parse(JSON.stringify(default_form_values));
    this.state = this.getState(new_form_values);
  }

  getState = (form_values) => {
    var story_id = BoardStore.getSelectedStoryId();
    var new_state = {
      error: ErrorStore.getTaskErrors(),
      task: BoardStore.getTask(),
      last_sel_story_id: story_id,
      users: BoardStore.getUsersForBoard()
    };

    if (new_state.task) {
      new_state.form_values = new_state.task;
      new_state.last_sel_story_id = new_state.task.story_id;
    } else if (form_values) {
      new_state.form_values = form_values;
      new_state.last_sel_story_id = story_id;
    }

    return new_state;
  }

  _onError = () => {
    this.setState(this.getState());
  }

  _onChange = () => {
    var task = BoardStore.getTask();
    if (task && task !== this.state.task) {
      this.setState(this.getState(task));
    } else if (!task) {
      this.setDefaultFormValues();
    }
    this.setState(this.getState());
  }

  onChange(component, key, value, select_value) {
    var form_values = this.state.form_values;
    form_values[key] = select_value || value;
    this.setState({form_values: form_values});
  }

  onChangeUserSelect(component, key, opt, value) {
    var form_values = this.state.form_values;
    form_values[key] = value;
    this.setState({form_values: form_values});
  }

  onChangeStorySelect(component, key, opt, value) {
    BoardActions.updateSelectedStoryId(value);
    this.onChange(component, key, opt, value);
  }

  componentWillUnmount = () => {
    ErrorStore.removeChangeListener(this._onError);
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    ErrorStore.addChangeListener(this._onError);
    BoardStore.addChangeListener(this._onChange);
  }

  componentWillUpdate = (nextProps) => {
    if (!this.props.open && nextProps.open) {
      var new_form_values = JSON.parse(JSON.stringify(default_form_values));
      this.setState(this.getState(new_form_values));
    }
  }

  setDefaultFormValues = () => {
    var new_form_values = JSON.parse(JSON.stringify(default_form_values));
    this.setState({form_values: new_form_values});
  }

  handleFormSubmit = () => {
    var form_data = JSON.parse(JSON.stringify(this.state.form_values));
    if (!form_data.story_id) {
      form_data.story_id = BoardStore.getSelectedStoryId();
    }

    if (this.state.task) {
      BoardActions.updateTask(form_data);
    } else {
      form_data.column_id = BoardStore.getFirstColumn().id;
      BoardActions.addTask(form_data);
    }
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
        Select User
        <br />
        <UserSelect
          users={this.state.users}
          user_id={this.state.form_values.user_id}
          onChange={
            (comp, opt, val) => {
              this.onChangeUserSelect(comp, "user_id", opt, val);
            }
          }
        />
        <br />
        <br />
        Select Story
        <br />
        <StorySelect
          onChange={
            (comp, opt, val) => {
              this.onChangeStorySelect(comp, "story_id", opt, val);
            }
          }
          story_id={this.state.last_sel_story_id}
          errorText={this.state.error.story_id}
        />
        <br />
        <br />
        Add a name
        <br />
        <TextField ref="task_name"
          hintText="Task Name"
          fullWidth={true}
          errorText={this.state.error.name}
          value={this.state.form_values.name}
          onChange={(comp, val) => {this.onChange(comp, "name", val);}}
        />
        <br />
        <br />
        Add a Description
        <br />
        <TextField ref="task_desc"
          hintText="Task Description"
          errorText={this.state.error.desc}
          multiLine={true}
          fullWidth={true}
          value={this.state.form_values.desc}
          onChange={(comp, val) => {this.onChange(comp, "desc", val);}}
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
