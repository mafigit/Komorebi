import React from 'react';
import { Col, Panel } from 'react-bootstrap';
import DeleteForeverIcon from 'material-ui/svg-icons/action/delete-forever';
import BoardActions from './actions/BoardActions';

const styles = {
  small_icon: {
    width: 20,
    height: 20,
    float: "right",
    color: "#ccc"
  }
};

export default class Column extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  onIconClickHandler = (event, id) => {
    event.stopPropagation();
    BoardActions.deleteColumn(id);
  }

  render() {
    const title = (
      <h3>{this.props.name}
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
