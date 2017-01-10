/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
var MessageActions = {
  showMessage: (message) => {
    AppDispatcher.dispatch({
      actionType: "SHOW_MESSAGE",
      message: message
    });
  },
  hideMessage: () => {
    AppDispatcher.dispatch({
      actionType: "HIDE_MESSAGE",
    });
  },
};
module.exports = MessageActions;
