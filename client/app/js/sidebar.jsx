import React from 'react';
import { Col, ListGroup } from 'react-bootstrap';
import StoryCard from './story_card';
import BoardStore from './store/BoardStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      selected_stories: BoardStore.getSelectedStories()
    };
  }
  _onChange = () => {
    this.setState(this.getState());
  }

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
  }

  render() {
    var story_cards = BoardStore.getStories().map((story, key) => {
      if (this.state.selected_stories.indexOf(story.id) >= 0) {
        return <StoryCard
          active={true} story_id={story.id} key={key} name={story.name}
        />;
      } else {
        return <StoryCard
          active={false} story_id={story.id} key={key} name={story.name}
        />;
      }
    });
    return <Col lg={2} xs={12} md={12} >
      <ListGroup className="sidebar">
        {story_cards}
      </ListGroup>
    </Col>;
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
