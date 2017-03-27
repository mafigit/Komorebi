import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ReactDOM from 'react-dom';
import StoryPointPicker from './story_point_picker';
import ColorSelect from './color_select';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import ErrorStore from './store/ErrorStore';

const default_form_values = {
  name: "",
  desc: "",
  points: 1,
  requirements: "",
  board_id: "",
  color: ""
};

export default class StoryEditDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState(default_form_values);
  }

  getState = (form_values) => {
    var new_state = {
      error: ErrorStore.getStoryErrors(),
      story: BoardStore.getStory(),
    };
    if (form_values) {
      new_state.form_values = form_values;
    }
    return new_state;
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

  componentDidUpdate = () => {
    var story = BoardStore.getStory();
    if (story && story !== this.state.story) {
      this.setState(this.getState(story));
    } else if (!story && this.state.story) {
      this.setDefaultFormValues();
    }
  }

  setDefaultFormValues = () => {
    this.setState({story: null, form_values: default_form_values, });
  }

  handleFormSubmit = () => {
    var form_values = this.state.form_values;
    form_values.board_id = BoardStore.getBoardId();

    if (this.state.story) {
      BoardActions.updateStory(form_values);
    } else {
      BoardActions.addStory(form_values);
    }
  }

  onChange(component, key, value) {
    var form_values = this.state.form_values;
    form_values[key] = value;
    this.setState({form_values: form_values});
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
         <StoryPointPicker
           title="Points"
           key='0'
           valueHandler={(comp, val) => {this.onChange(comp, "points", val);}}
           value={this.state.form_values.points}
          />
        <br />
        Add a name
        <br />
        <TextField ref="story_name"
          hintText="Story Name"
          errorText={this.state.error.name}
          fullWidth={true}
          value={this.state.form_values.name}
          onChange={(comp, val) => {this.onChange(comp, "name", val);}}
        />
        <br />
        Select a color
        <br />
        <ColorSelect ref="story_color"
          value={this.state.form_values.color}
          onChange={(comp, index, val) => {this.onChange(comp, "color", val);}}
          errorText={this.state.error.color} />
        <br />
        <br />
        Add a Description
        <br />
        <TextField ref="story_desc"
          hintText="Story Description"
          errorText={this.state.error.desc}
          multiLine={true}
          fullWidth={true}
          value={this.state.form_values.desc}
          onChange={(comp, val) => {this.onChange(comp, "desc", val);}}
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
          value={this.state.form_values.requirements}
          onChange={(comp, val) => {this.onChange(comp, "requirements", val);}}
        />
        <br />
      </Dialog>
    );
  }

  render() {
    return this.editForm();
  }
}
