import React from 'react';
import ReactDOM from 'react-dom';
import {Card, CardTitle, CardActions, CardText} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import PrevIcon from 'material-ui/svg-icons/navigation/chevron-left';
import NextIcon from 'material-ui/svg-icons/navigation/chevron-right';
import { Grid, Row, Col } from 'react-bootstrap';

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
                  tooltipPosition="top-center">
                  <PrevIcon />
                </IconButton>
                <IconButton tooltip="Move To Next Column" style={styles.small_button}
                  iconStyle={styles.small_icon}
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
