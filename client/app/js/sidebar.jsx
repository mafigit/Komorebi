import React from 'react';
import { Col } from 'react-bootstrap';
import {List} from 'material-ui/List';
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
      var active = this.state.selected_stories.indexOf(story.id) >= 0;
      return <StoryCard active={active} story_id={story.id} key={key}
        name={story.name} color={story.color} />;
    });
    return <Col lg={3} xs={12} md={12} >
      <List>
        {story_cards}
      </List>
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
