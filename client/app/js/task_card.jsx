import React from 'react';
import ReactDOM from 'react-dom';

export default class Column extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }

  render() {
    return <div className="column">
      <h3>{this.props.name}</h3>
      <div className="content">
      </div>
    </div>
  }
}
