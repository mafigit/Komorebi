import React from 'react';
import { Col, Panel } from 'react-bootstrap';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';
import PrevIcon from 'material-ui/svg-icons/navigation/chevron-left';
import NextIcon from 'material-ui/svg-icons/navigation/chevron-right';
import IconButton from 'material-ui/IconButton';
import BoardActions from './actions/BoardActions';

const styles = {
  small_icon: {
    width: 20,
    height: 20,
    float: "right",
    color: "#ccc"
  },
  small_button: {
    width: 20,
    height: 20,
    float: "right",
    padding: 0
  }
};

export default class Column extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  onIconClickHandler = (event, id) => {
    event.stopPropagation();

    BoardActions.showConfirmation(() => {
      BoardActions.deleteColumn(id);
    });
  }

  onRightButton = () => {
    BoardActions.moveColumn(this.props.id, "left");
  }

  disableRightButton = () => {
    return this.props.position == 0;
  }

  onLeftButton = () => {
    BoardActions.moveColumn(this.props.id, "right");
  }

  disableLeftButton = () => {
    return this.props.position == this.props.max;
  }

  render() {
    var left_style = JSON.parse(JSON.stringify(styles.small_button));
    var right_style = JSON.parse(JSON.stringify(styles.small_button));

    if (this.disableLeftButton()) {
      left_style.display = "none";
    }

    if (this.disableRightButton()) {
      right_style.display = "none";
    }

    var moveLeftIcon = (
      <IconButton
        style={left_style}
        disabled={this.disableLeftButton()}
        iconStyle={styles.small_icon}
        onClick={this.onLeftButton}
        className="nextButton">
        <NextIcon />
      </IconButton>);

    var moveRightIcon = (
      <IconButton
        style={right_style}
        disabled={this.disableRightButton()}
        iconStyle={styles.small_icon}
        onClick={this.onRightButton}
        className="prevButton">
        <PrevIcon />
      </IconButton>);

    const title = (
      <h3>{this.props.name}
        {moveLeftIcon}
        {moveRightIcon}
        <DeleteForeverIcon onClick={event =>
          {this.onIconClickHandler(event, this.props.id);}}
          style={styles.small_icon}
        />
      </h3>
    );
    return <Col lg={3} xs={12} md={12} >
      <Panel className="column" header={title}>
        {this.props.children}
      </Panel>
    </Col>;
  }
}
