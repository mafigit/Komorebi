import React from 'react';
import { Col, Panel } from 'react-bootstrap';

export default class Column extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    const title = (
      <h3>{this.props.name}</h3>
    );
    return <Col lg={3} xs={12} md={12} >
      <Panel className="column" header={title}>
        {this.props.children}
      </Panel>
    </Col>;
  }
}
