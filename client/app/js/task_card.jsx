import React from 'react';
import ReactDOM from 'react-dom';
import {Card, CardTitle, CardText} from 'material-ui/Card';

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
    </Card>
  }
}
