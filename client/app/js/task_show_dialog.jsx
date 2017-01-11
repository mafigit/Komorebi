import React from 'react';
import Dialog from 'material-ui/Dialog';
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

export default class TaskShowDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      task_id: null,
      name: "",
      desc: ""
    };
  }

  componentDidUpdate = () => {
    var task = BoardStore.getTaskById(this.props.task_id);
    if (task && (this.props.task_id !== null) &&
      (this.props.task_id !== this.state.task_id)) {

      this.setState({
        task_id: task.id,
        name: task.name,
        desc: task.desc,
      });
    }
  }

  onClickDestroy = () => {
    BoardActions.deleteTask(this.props.task_id);
  }

  showForm = () => {
    return(
      <Dialog
        title={this.state.name}
        modal={false}
        open={this.props.open}
        onRequestClose={BoardActions.closeTaskShowDialog}
        autoScrollBodyContent={true}
      >
        <br />
        <ReactMarkdown source={this.state.desc}/>
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
