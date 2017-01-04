import React from 'react';
import { Col, ListGroup } from 'react-bootstrap';
import StoryCard from './story_card';
import BoardStore from './store/BoardStore';

export default class Sidebar extends React.Component {
  render() {
    var story_cards = BoardStore.getStories().map((story, key) => {
      return <StoryCard story_id={story.id} key={key} name={story.name} />;
    });
    return <Col lg={2} xs={12} md={12} >
      <ListGroup className="sidebar">
        {story_cards}
      </ListGroup>
    </Col>;
  }
}
