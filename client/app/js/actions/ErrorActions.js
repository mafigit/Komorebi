/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
var ErrorActions = {
  addBoardErrors: (errors) => {
    AppDispatcher.dispatch({
      actionType: "ADD_BOARD_ERRORS",
      errors: errors
    });
  },
  removeBoardErrors: () => {
    AppDispatcher.dispatch({
      actionType: "REMOVE_BOARD_ERRORS"
    });
  }
};
module.exports = ErrorActions;
