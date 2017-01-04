import React from 'react';
import Dialog from 'material-ui/Dialog';
import Ajax from  'basic-ajax';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ReactMarkdown from 'react-markdown';
import BoardActions from './actions/BoardActions';

export default class StoryShowDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      story_view_values: {
        story_id: null,
        name: "",
        desc: "",
        requirements: "",
        points: ""
      }
    };
  }

  componentDidUpdate = () => {
    if ((this.props.story_id !== null) &&
      (this.props.story_id !== this.state.story_view_values.story_id)) {

      let url = `/stories/${this.props.story_id}`;
      Ajax.get(url, {"Accept": "application/json"}).then(response => {
        if (response.status == 200) {
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
        onRequestClose={BoardActions.closeStoryShowDialog}
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

  render() {
    return this.showForm();
  }
}
