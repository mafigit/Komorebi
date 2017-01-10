/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
import EventEmitter from 'events';
import assign from 'object-assign';

var board_errors = {
  board_name: ""
};

var column_errors = {
  column_name: ""
};

var task_errors = {
  name: "",
  desc: ""
};

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
      board_errors = {
        board_name: ""
      };
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "ADD_COLUMN_ERRORS":
      column_errors = action.errors;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "REMOVE_COLUMN_ERRORS":
      column_errors = {
        column_name: ""
      };
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "ADD_TASK_ERRORS":
      task_errors = action.errors;
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    case "REMOVE_TASK_ERRORS":
      task_errors = {
        name: "",
        desc: ""
      };
      ErrorStore.emitChange(ERROR_EVENT);
      break;
    default:
      break;
  }
});
module.exports = ErrorStore;
