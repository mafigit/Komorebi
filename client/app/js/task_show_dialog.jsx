import React from 'react';
import Dialog from 'material-ui/Dialog';
import ReactMarkdown from 'react-markdown';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import {BottomNavigation, BottomNavigationItem} from
  'material-ui/BottomNavigation';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import ShareIcon from 'material-ui/svg-icons/social/share.js';

const icon_style = {
  display: "initial"
};

export default class TaskShowDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_share_link: false,
      task_id: null,
      name: "",
      desc: "",
      user: null,
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
        user: task.user
      });
    }
  }

  onClickShare = () => {
    this.setState({show_share_link: !this.state.show_share_link});
  }

  onClickDestroy = () => {
    BoardActions.showConfirmation(() => {
      BoardActions.deleteTask(this.props.task_id);
      BoardActions.closeTaskShowDialog();
    });
  }

  onClickEdit = () => {
    BoardActions.showTaskDialog(this.props.task_id);
  }

  showForm = () => {
    var show_link_style = this.state.show_share_link ? {} : {display: "none"};
    var link = window.location.protocol + "//" + window.location.host +
      window.location.pathname + "?task=" + this.props.task_id;
    var show_link_div = <div style={show_link_style}>{link}</div>;
    var img = undefined;
    if (this.state.user) {
      if (this.state.user.image_path) {
        img = this.state.user.image_path;
      } else {
        img = "/images/users/" + this.state.user.name +  ".png";
      }
    }
    return(
      <Dialog
        modal={false}
        open={this.props.open}
        onRequestClose={BoardActions.closeTaskShowDialog}
        autoScrollBodyContent={true}
      ><Card className="task">
          <CardHeader titleStyle={{fontSize: 20}}
            title={this.state.name}
            avatar={img}
          />
          <CardText className="task-text">
            <ReactMarkdown source={this.state.desc}/>
            {show_link_div}
          </CardText>
        </Card>
        <br />
        <BottomNavigation>
          <BottomNavigationItem label="Delete"
            icon={<DeleteForeverIcon style={icon_style} />}
            onTouchTap={this.onClickDestroy} />
          <BottomNavigationItem label="Edit"
            icon={<EditIcon style={icon_style} />}
            onTouchTap={this.onClickEdit} />
          <BottomNavigationItem label="Share"
            icon={<ShareIcon style={icon_style} />}
            onTouchTap={this.onClickShare} />
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
