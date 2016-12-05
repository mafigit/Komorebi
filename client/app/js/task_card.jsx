import React from 'react';
import ReactDOM from 'react-dom';
import {Card, CardTitle, CardActions, CardText} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import PrevIcon from 'material-ui/svg-icons/navigation/chevron-left';
import NextIcon from 'material-ui/svg-icons/navigation/chevron-right';
import { Grid, Row, Col } from 'react-bootstrap';
import BoardActions from './actions/BoardActions';
import BoardStore from './store/BoardStore';

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
}

export default class Column extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  onPrevButton = (event) => {
    var next_column_id = this.getNewColumnId(-1);
    if (next_column_id != this.props.column_id) {
      this.updateTask(next_column_id);
    }
  }

  onNextButton = (event) => {
    var next_column_id = this.getNewColumnId(1);
    if (next_column_id != this.props.column_id) {
      this.updateTask(next_column_id);
    }
  }

  updateTask = (column_id) => {
    BoardActions.updateTask({
      "id": this.props.task_id,
      "name": this.props.name,
      "desc": this.props.desc,
      "column_id": column_id,
      "priority": this.props.task_priority,
      "story_id": this.props.task_story_id
    });
  }

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

  render () {
    return <Card className="task">
      <CardTitle title={this.props.name} subtitle="Story tag" />
      <CardText className="task-text">
       {this.props.desc}
      </CardText>
      <CardActions>
        <Grid fluid={true}>
          <Row className="show-grid">
            <Col lg={4} >
            <IconButton tooltip="Edit Task" style={styles.small_button}
              iconStyle={styles.small_icon}
              tooltipPosition="top-center">
              <EditIcon />
            </IconButton>
            </Col>
            <Col lg={8} >
              <div className="pull-right">
                <IconButton tooltip="Move To Previous Column" style={styles.small_button}
                  iconStyle={styles.small_icon}
                  onClick={this.onPrevButton}
                  tooltipPosition="top-center">
                  <PrevIcon />
                </IconButton>
                <IconButton tooltip="Move To Next Column" style={styles.small_button}
                  iconStyle={styles.small_icon}
                  onClick={this.onNextButton}
                  tooltipPosition="top-center">
                  <NextIcon />
                </IconButton>
              </div>
            </Col>
          </Row>
        </Grid>
      </CardActions>
    </Card>
  }
}
