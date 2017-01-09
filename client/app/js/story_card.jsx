import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import IconButton from 'material-ui/IconButton';
import OpenInNewIcon from 'material-ui/svg-icons/action/open-in-new';
import BoardActions from './actions/BoardActions';

const styles = {
  small_button: {
    width: 20,
    height: 20,
    padding: 0,
    position: 'absolute',
    right: '4px'
  },
  small_icon: {
    width: 20,
    height: 20
  }
}

class OpenIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  onClickHandler = (event) => {
    event.stopPropagation();
    BoardActions.openStoryShowDialog(this.props.story_id);
  }

  render() {
    return <IconButton tooltip="Show story" style={styles.small_button}
      iconStyle={styles.small_icon} onClick={this.onClickHandler}>
      <OpenInNewIcon />
    </IconButton>;
  }
}

export default class StoryCard extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  onClickHandler = () => {
    BoardActions.showTasksForStoryId(this.props.story_id);
  }

  render() {
    return <ListGroupItem onClick={this.onClickHandler} className="story_card" href="#">
      {this.props.name}
      <OpenIcon story_id={this.props.story_id} />
    </ListGroupItem>;
  }
}
