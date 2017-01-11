import React from 'react';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import FloatingActionButton from 'material-ui/FloatingActionButton';
export default class StoryPointPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 1
    };
    this.value = 1;
    this.iterrator = 0;
    this.range = this.props.range || [
      1, 2, 3, 5, 8, 13, 21, 34, 55
    ];
  }

  storyPointsHandler = (next, prev) => {
    if(next && this.iterrator >= 0 && this.range.length - 1 > this.iterrator) {
      this.iterrator++;
    } else if(prev && this.iterrator > 0) {
      this.iterrator--;
    }
    this.value = this.range[this.iterrator];
    if (this.props.valueHandler) {
      this.props.valueHandler(this.value);
    }
    this.setState({value: this.value});
  }

  render() {
    const btnstyle = {
      marginBottom: 20,
      marginLeft: 20,
      marginTop: 20,
      marginRight: 5,
      fontSize: 30
    };
    const header_style = {
      position: "relative",
      bottom: 13
    };
    return <div>
    <span style={header_style}>{this.props.title}</span>
    <FloatingActionButton mini={true}
      onClick={() => {this.storyPointsHandler(true, false);}}
      style={btnstyle} key="1">
      <ContentAdd />
    </FloatingActionButton>
    <FloatingActionButton mini={true}
      onClick={() => {this.storyPointsHandler(false, true);}}
      style={btnstyle} key="3" secondary={true} >
      <ContentRemove />
    </FloatingActionButton>
    <FloatingActionButton mini={true} ref="story_points"
      style={btnstyle} key="2" disabled={true}>
      {this.state.value}
    </FloatingActionButton>
    </div>;
  }
}
