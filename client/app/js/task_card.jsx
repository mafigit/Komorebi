import React from 'react';
import {Card, CardTitle, CardActions, CardText} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import OpenInNewIcon from 'material-ui/svg-icons/action/open-in-new';
import PrevIcon from 'material-ui/svg-icons/navigation/chevron-left';
import NextIcon from 'material-ui/svg-icons/navigation/chevron-right';
import { Grid, Row, Col } from 'react-bootstrap';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';
import ReactMarkdown from 'react-markdown';

const styles = {
  small_icon: {
    width: 20,
    height: 20
  },
  small_button: {
    width: 20,
    height: 20,
    padding: 0
  }
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
    var story = BoardStore.getStoryById(this.props.task_story_id);
    return <Card className="task">
      <CardTitle titleStyle={{fontSize: 20}}
        title={this.props.name}
        subtitle={story.name}
      />
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
