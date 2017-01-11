/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
import EventEmitter from 'events';
import assign from 'object-assign';
import ErrorFields from '../constants/ErrorFields';

var board_errors = ErrorFields.BOARD;
var column_errors = ErrorFields.COLUMN;
var task_errors = ErrorFields.TASK;
var story_errors = ErrorFields.STORY;
var user_errors = ErrorFields.USER;

var ERROR_EVENT = 'error';
var ErrorStore = assign({}, EventEmitter.prototype, {
  getBoardErrors: () => {
    return board_errors;
  },
  getColumnErrors: () => {
    return column_errors;
  },
  getTaskErrors: () => {
    return task_errors;
  },
  getStoryErrors: () => {
    return story_errors;
  },
  getUserErrors: () => {
    return user_errors;
  },
  emitChange: function() {
    this.emit(ERROR_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(ERROR_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(ERROR_EVENT, callback);
  }
});

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case "ADD_BOARD_ERRORS":
      board_errors = action.errors;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "REMOVE_BOARD_ERRORS":
      board_errors = ErrorFields.BOARD;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "ADD_COLUMN_ERRORS":
      column_errors = action.errors;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "REMOVE_COLUMN_ERRORS":
      column_errors = ErrorFields.COLUMN;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "ADD_TASK_ERRORS":
      task_errors = action.errors;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "REMOVE_TASK_ERRORS":
      task_errors =  ErrorFields.TASK;
      break;
    case "ADD_STORY_ERRORS":
      story_errors = action.errors;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "REMOVE_STORY_ERRORS":
      story_errors = ErrorFields.STORY;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "ADD_USER_ERRORS":
      user_errors = action.errors;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "REMOVE_USER_ERRORS":
      user_errors = ErrorFields.USER;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    default:
      break;
  }
});
module.exports = ErrorStore;
