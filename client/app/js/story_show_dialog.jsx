import React from 'react';
import Dialog from 'material-ui/Dialog';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ReactMarkdown from 'react-markdown';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {BottomNavigation, BottomNavigationItem} from
  'material-ui/BottomNavigation';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';

const icon_style = {
  display: "initial"
};

export default class StoryShowDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      story_id: null,
      name: "",
      desc: "",
      requirements: "",
      points: ""
    };
  }

  componentDidUpdate = () => {
    var story = BoardStore.getStoryById(this.props.story_id);
    if (story && (this.props.story_id !== null) &&
      (this.props.story_id !== this.state.story_id)) {

      this.setState({
        story_id: story.id,
        name: story.name,
        desc: story.desc,
        requirements: story.requirements,
        points: story.points
      });
    }
  }

  onClickDestroy = () => {
    BoardActions.deleteStory(this.props.story_id);
  }

  showForm = () => {
    return(
      <Dialog
        title={
          <div style={{padding: "10px", height: "40px"}}>
            <div style={{float: "left", marginLeft: "20px", marginTop: "5px"}}>
              {this.state.name}
            </div>
            <FloatingActionButton
              style={{marginRight: "20px", marginLeft: "20px", float: "right"}}
              ref="story_points" disabled={true} mini={true}>
              {this.state.points}
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
        <ReactMarkdown source={this.state.desc}/>
        <br />
        Requirements
        <br />
        <ReactMarkdown source={this.state.requirements}/>
        <br />
        <BottomNavigation>
          <BottomNavigationItem label="Delete"
            icon={<DeleteForeverIcon style={icon_style} />}
            onTouchTap={this.onClickDestroy} />
        </BottomNavigation>
      </Dialog>
    );
  }

  render() {
    return this.showForm();
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
