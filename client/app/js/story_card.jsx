import React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import BoardActions from './actions/BoardActions';

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
    </ListGroupItem>;
  }
}
