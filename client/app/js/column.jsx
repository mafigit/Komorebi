import React from 'react';
import ReactDOM from 'react-dom';

export default class TaskCard extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return <div className="task_card">
      <h3>{this.props.name}</h3>
      <div className="content">
      </div>
    </div>
  }
}
