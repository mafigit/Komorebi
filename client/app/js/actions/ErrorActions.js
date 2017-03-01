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
  },
  addColumnErrors: (errors) => {
    AppDispatcher.dispatch({
      actionType: "ADD_COLUMN_ERRORS",
      errors: errors
    });
  },
  removeColumnErrors: () => {
    AppDispatcher.dispatch({
      actionType: "REMOVE_COLUMN_ERRORS"
    });
  },
  addTaskErrors: (errors) => {
    AppDispatcher.dispatch({
      actionType: "ADD_TASK_ERRORS",
      errors: errors
    });
  },
  removeTaskErrors: () => {
    AppDispatcher.dispatch({
      actionType: "REMOVE_TASK_ERRORS"
    });
  },
  addStoryErrors: (errors) => {
    AppDispatcher.dispatch({
      actionType: "ADD_STORY_ERRORS",
      errors: errors
    });
  },
  removeStoryErrors: () => {
    AppDispatcher.dispatch({
      actionType: "REMOVE_STORY_ERRORS"
    });
  },
  addUserErrors: (errors) => {
    AppDispatcher.dispatch({
      actionType: "ADD_USER_ERRORS",
      errors: errors
    });
  },
  removeUserErrors: () => {
    AppDispatcher.dispatch({
      actionType: "REMOVE_USER_ERRORS"
    });
  },
  addDodErrors: (errors) => {
    AppDispatcher.dispatch({
      actionType: "ADD_DOD_ERRORS",
      errors: errors
    });
  },
  removeDodErrors: () => {
    AppDispatcher.dispatch({
      actionType: "REMOVE_DOD_ERRORS"
    });
  },
  addStoryIssueErrors: (errors) => {
    AppDispatcher.dispatch({
      actionType: "ADD_STORY_ISSUE_ERRORS",
      errors: errors
    });
  },
  removeStoryIssueErrors: () => {
    AppDispatcher.dispatch({
      actionType: "REMOVE_STORY_ISSUE_ERRORS"
    });
  }
};
module.exports = ErrorActions;
