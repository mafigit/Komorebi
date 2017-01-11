/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
import EventEmitter from 'events';
import assign from 'object-assign';

var snackbar = {
  open: false,
  message: ""
};

var MESSAGE_EVENT = 'message';

var MessageStore = assign({}, EventEmitter.prototype, {
  getSnackbarOpen: function () {
    return snackbar.open;
  },
  getMessage: function () {
    return snackbar.message;
  },
  emitChange: function() {
    this.emit(MESSAGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(MESSAGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(MESSAGE_EVENT, callback);
  }
});

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case "SHOW_MESSAGE":
      snackbar.message = action.message;
      snackbar.open = true;
      MessageStore.emitChange();
      break;
    case "HIDE_MESSAGE":
      snackbar = {
        message: "",
        open: false
      };
      MessageStore.emitChange(MESSAGE_EVENT);
      break;
    default:
      break;
  }
});
module.exports = MessageStore;
