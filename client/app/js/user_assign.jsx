import React from 'react';
import BoardStore from './store/BoardStore';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import UserList from './user_list';
import BoardList from './board_list';
import { Grid, Row, Col } from 'react-bootstrap';

export default class UserAssgin extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
    };
  }

  _onChange = () => {
    this.setState(this.getState());
  }

  componentWillUnmount = () => {
    BoardStore.removeChangeListener(this._onChange);
  }

  componentDidMount = () => {
    BoardStore.addChangeListener(this._onChange);
  }

  render() {
    return <Grid fluid={true}>
      <Row>
        <Col md={6} mdPush={6} >
          <h2>Boards</h2>
          <BoardList assign={true} />
        </Col>
        <Col md={6} mdPull={6} >
          <h2>Users</h2>
          <UserList />
        </Col>
      </Row>
    </Grid>;
  }

  static childContextTypes = {
    muiTheme: React.PropTypes.object
  }

  getChildContext() {
    return {
      muiTheme: getMuiTheme()
    };
  }
}
