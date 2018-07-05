import React from 'react';
import {Card, CardHeader, CardActions, CardText} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import OpenInNewIcon from 'material-ui/svg-icons/action/open-in-new';
import PrevIcon from 'material-ui/svg-icons/navigation/chevron-left';
import NextIcon from 'material-ui/svg-icons/navigation/chevron-right';
import { Grid, Row, Col } from 'react-bootstrap';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import ReactMarkdown from 'react-markdown';
import BookMarkIcon from 'material-ui/svg-icons/action/bookmark';
import Badge from 'material-ui/Badge';

const styles = {
  small_icon: {
    width: 20,
    height: 20
  },
  small_button: {
    width: 20,
    height: 20,
    padding: 0
  },
};

/**
 * task card commponent
 */
export default class Column extends React.Component {
  /**
   * constructor
   * @param {object} props
  */
  constructor(props) {
    super(props);
    /**
     * @type {object}
     * @property {number} task_id id of task
     * @property {string} name name of task
     * @property {string} desc description of task
     * @property {number} task_story_id story id of task
     * @property {number} column_id column id of the task
     * @property {user} user user of the task
     * @property {highlighted} task with other background
     */
    this.state={};
  }

  /**
   * handle click prev button event
   * @param {SytheticEvent} event
   */
  onPrevButton = () => {
    var next_column_id = this.getNewColumnId(-1);
    if (next_column_id != this.props.column_id) {
      this.updateTask(next_column_id);
    }
  }

  /**
   * handle click next button event
   * @param {SytheticEvent} event
   */
  onNextButton = () => {
    var next_column_id = this.getNewColumnId(1);
    if (next_column_id != this.props.column_id) {
      this.updateTask(next_column_id);
    }
  }

  onClickOpen = () => {
    BoardActions.openTaskShowDialog(this.props.task_id);
  }

  /**
   * update task
   * @param {number} column_id id of the new column for task
   */
  updateTask = (column_id) => {
    BoardActions.updateTaskPosition({
      "id": this.props.task_id,
      "name": this.props.name,
      "desc": this.props.desc,
      "story_id": this.props.task_story_id,
      "column_id": column_id
    });
  }

  /**
   * calculate the new column_id (position) for the task
   * @param {number} bumper go left or right (-1|+1)
   */
  getNewColumnId = (bumper) => {
    var column_ids = BoardStore.getColumnsInOrder().map(col => {
      return col.id;
    });

    var cur_col_id = this.props.column_id;
    var next_index = column_ids.indexOf(cur_col_id) + bumper;

    if (column_ids[next_index]) {
      return column_ids[next_index];
    } else {
      return cur_col_id;
    }
  }

  disablePrevBtn = () => {
    var cols = BoardStore.getColumnsInOrder();
    if (cols.length > 0) {
      var first_col = cols[0];
      return first_col.id === this.props.column_id;
    }
    return true;
  }

  disableNextBtn = () => {
    var cols = BoardStore.getColumnsInOrder();
    if (cols.length > 0) {
      var last_col = cols[cols.length-1];
      return last_col.id === this.props.column_id;
    }
    return true;
  }

  render () {
    var shadow = "rgba(0, 0, 0, 99) 0px 1px 60px, rgba(0, 0, 0, 0.12) 0px 1px 4px";
    var style = this.props.highlighted ? {boxShadow: shadow} : {};
    var story = BoardStore.getStoryById(this.props.task_story_id);
    var name = <span>{this.props.name}</span>;
    var icon = <BookMarkIcon color={story.color}/>;
    var user_name = "";
    var img = undefined;
    if (this.props.user) {
      user_name = <span>{this.props.user.name}</span>;
      if (this.props.user.image_path) {
        img = this.props.user.image_path;
      } else {
        img = "/images/users/" + this.props.user.name +  ".png";
      }
    }

    return <Card className="task" style={style}>
      <Badge badgeContent={icon} style={{width: "100%"}}>
        <CardHeader titleStyle={{fontSize: 16}}
          title={name}
          avatar={img}
          subtitle={user_name}
        />
      </Badge>
      <CardText className="task-text">
        <ReactMarkdown source={this.props.desc}/>
      </CardText>
      <CardActions>
        <Grid fluid={true}>
          <Row className="show-grid">
            <Col lg={4} >
            <IconButton tooltip="Show Task" style={styles.small_button}
              iconStyle={styles.small_icon} onClick={this.onClickOpen}
              tooltipPosition="top-center">
              <OpenInNewIcon />
            </IconButton>
            </Col>
            <Col lg={8} >
              <div className="pull-right">
                <IconButton
                  style={styles.small_button}
                  disabled={this.disablePrevBtn()}
                  iconStyle={styles.small_icon}
                  onClick={this.onPrevButton}
                  className="prevButton">
                  <PrevIcon />
                </IconButton>
                <IconButton
                  style={styles.small_button}
                  disabled={this.disableNextBtn()}
                  iconStyle={styles.small_icon}
                  onClick={this.onNextButton}
                  className="nextButton">
                  <NextIcon />
                </IconButton>
              </div>
            </Col>
          </Row>
        </Grid>
      </CardActions>
    </Card>;
  }
}
