/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
import EventEmitter from 'events';
import assign from 'object-assign';

var board_errors = {
  board_name: ""
};

var ERROR_EVENT = 'error';
var ErrorStore = assign({}, EventEmitter.prototype, {
  getBoardErrors: () => {
    return board_errors;
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
    default:
      break;
  }
});
module.exports = ErrorStore;
