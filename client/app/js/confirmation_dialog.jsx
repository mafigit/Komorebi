import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import BoardStore from './store/BoardStore';
import BoardActions from './actions/BoardActions';

/**
 * Alerts are urgent interruptions, requiring acknowledgement, that inform the user about a situation.
 */
export default class ConfirmationDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }

  getState = () => {
    return {
      open: BoardStore.getConfirmationOpen(),
      callback: BoardStore.getConfirmationCallback()
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

  handleYes = () => {
    this.state.callback();
    BoardActions.closeConfirmation();
  }

  handleClose = () => {
    BoardActions.closeConfirmation();
  }

  render() {
    const actions = [
      <FlatButton
        label="No"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Yes"
        primary={false}
        onTouchTap={this.handleYes}
      />,
    ];

    return (
      <div>
        <Dialog
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          The object will be destroyed and can not be retrived!
          <br />
          Are you sure?
        </Dialog>
      </div>
    );
  }
}
