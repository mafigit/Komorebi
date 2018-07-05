import React from 'react';
import BoardStore from './store/BoardStore';
import Dialog from 'material-ui/Dialog';
import {List, ListItem} from 'material-ui/List';
import BoardActions from './actions/BoardActions';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import UnarchiveIcon from 'material-ui/svg-icons/action/settings-backup-restore';

export default class ArchivedStories extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    var data = BoardStore.getArchivedStories();
    if (!data) {
      BoardActions.fetchArchivedStories();
    }
    data = BoardStore.getArchivedStories();
    return {
      open: BoardStore.getArchivedStoriesOpen(),
      data: (data ? data : []),
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
    const btnstyle = {
      marginBottom: 0,
      marginLeft: 0,
      marginTop: 5,
      marginRight: 5,
      fontSize: 30
    };
    var items = this.getState().data.map((story) => {
      var date = new Date(story.updated_at/1000/1000).toDateString();
      var leftIcon = <FloatingActionButton mini={true}
        style={btnstyle} key={story.name} disabled={true}>
        {story.points}
      </FloatingActionButton>;
      var rightIcon = <UnarchiveIcon
        onTouchTap={BoardActions.unarchiveStory.bind(this, story)} />;
      
      return <ListItem primaryText={story.name} rightIcon={rightIcon}
        key={story.name} leftIcon={leftIcon} secondaryText={date} />;
    });
    return <Dialog
        title={"Archived Stories"}
        modal={false}
        open={this.state.open}
        onRequestClose={BoardActions.closeArchivedStories}
        autoScrollBodyContent={true}
      >
      <List>
        {items}
      </List>
    </Dialog>;
  }
}
