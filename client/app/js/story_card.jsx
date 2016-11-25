import React from 'react';
import ReactDOM from 'react-dom';
import { ListGroupItem } from 'react-bootstrap';

export default class StoryCard extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return <ListGroupItem className="story_card" href="#">
      {this.props.name}
    </ListGroupItem>
  }
}
