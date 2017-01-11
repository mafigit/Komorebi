/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
import EventEmitter from 'events';
import assign from 'object-assign';
import Ajax from  'basic-ajax';
import ErrorActions from '../actions/ErrorActions';
import MessageActions from '../actions/MessageActions';
import ErrorFields from '../constants/ErrorFields';

var board_id = null;
var board_title = "";
var columns = [];
var stories = [];
var tasks = [];
var tasks_to_display = {};
var selected_stories = [];
var boards = [];
var selected_story_id: null;

var message = "";
var menu_open = false;
var column_dialog_open = false;
var story_edit_dialog_open = false;
var story_from_issue_edit_dialog_open = false;
var story_show_dialog_open = false;
var task_show_dialog_open = false;
var task_dialog_open = false;
var board_dialog_open = false;
var show_message = false;

var story_show_id = null;
var task_show_id = null;

var CHANGE_EVENT = 'change';

var BoardStore = assign({}, EventEmitter.prototype, {
  getSelectedStoryId: function () {
    return selected_story_id;
  },
  getBoardId: function () {
    return board_id;
  },
  getShowMessage: function() {
    return show_message;
  },
  getMessage: function() {
    return message;
  },
  getBoardTitle: function () {
    return board_title;
  },
  getColumns: function() {
    return columns;
  },
  getColumnsInOrder: function() {
    return columns.sort((a, b) => {
      return a.position - b.position;
    });
  },
  getBoards: function() {
    return boards;
  },
  getStories: function() {
    return stories;
  },
  getSelectedStories: function() {
    return selected_stories;
  },
  getTasks: function() {
    return tasks;
  },
  getTasksToDisplay: function() {
    tasks_to_display = selected_stories.reduce((acc, story_id) => {
      acc[story_id] = BoardStore.getTaskByStoryId(story_id);
      return acc;
    }, {});
    return tasks_to_display;
  },
  getTaskById: function(id) {
    return tasks.find((task) => { return task.id === id; });
  },
  getTaskByStoryId: function(story_id) {
    return tasks.reduce((acc, task) => {
      if (task.story_id == story_id) {
        acc.push(task);
      }
      return acc;
    }, []);
  },
  getMenuOpen: () => {
    return menu_open;
  },
  getColumnDialogOpen: () => {
    return column_dialog_open;
  },
  getStoryEditDialogOpen: () => {
    return story_edit_dialog_open;
  },
  getStoryFromIssueEditDialogOpen: () => {
    return story_from_issue_edit_dialog_open;
  },
  getTaskDialogOpen: () => {
    return task_dialog_open;
  },
  getFirstColumn: () => {
    return columns.find((column) => { return column.position === 0; });
  },
  getStoryShowDialogOpen: () => {
    return story_show_dialog_open;
  },
  getTaskShowDialogOpen: () => {
    return task_show_dialog_open;
  },
  getStoryShowId: () => {
    return story_show_id;
  },
  getTaskShowId: () => {
    return task_show_id;
  },
  getBoardDialogOpen: () => {
    return board_dialog_open;
  },
  getStoryById: (story_id) => {
    return stories.find((story) => { return story.id === story_id; });
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

var fetchBoard = () => {
  board_id = null;
  board_title = "";
  columns = [];
  return Ajax.get(window.location.pathname, {"Accept": "application/json"}).then(response => {
    if(response.status == 200) {
      var board = JSON.parse(response.responseText);
      board_id = board.id;
      board_title = board.name;
    }
  });
};

var deleteBoard = (id) => {
  var url = `/boards/${id}`;
  return Ajax.delete(url, {"Accept": "application/json"}).then(response => {
    if(response.status == 200) {
      MessageActions.showMessage("Successfully deleted");
      fetchBoards().then(() => {BoardStore.emitChange();});
    }
  });
};

var deleteColumn = (id) => {
  var url = `/columns/${id}`;
  return Ajax.delete(url, {"Accept": "application/json"}).then(response => {
    if(response.status == 200) {
      MessageActions.showMessage("Successfully deleted");
    }
  });
};

var deleteStory = (id) => {
  var url = `/stories/${id}`;
  return Ajax.delete(url, {"Accept": "application/json"}).then(response => {
    if(response.status == 200) {
      MessageActions.showMessage("Successfully deleted");
    }
  });
};

var deleteTask = (id) => {
  var url = `/tasks/${id}`;
  return Ajax.delete(url, {"Accept": "application/json"}).then(response => {
    if(response.status == 200) {
      MessageActions.showMessage("Successfully deleted");
    }
  });
};

var fetchBoards = () => {
  return Ajax.getJson('/boards').then(response => {
    boards = JSON.parse(response.response);
  });
};

var fetchStories = () => {
  stories = [];
  return Ajax.get(window.location.pathname + "/stories", {"Accept": "application/json"}).then(response => {
    if(response.status == 200) {
      stories = JSON.parse(response.responseText);
    }
  });
};

var fetchTasks = () => {
  tasks = [];
  return new Promise((resolve) => {
    let count = stories.length;
    if (count == 0) {
      resolve();
    }
    stories.forEach(function(story) {
      var url = `/stories/${story.id}/tasks`;
      Ajax.get(url, {"Accept": "application/json"}).then(response => {
        if(response.status == 200) {
          let fetched_tasks = JSON.parse(response.responseText);
          Array.prototype.push.apply(tasks, fetched_tasks);
          count--;
          if(count === 0) {
            resolve();
          }
        }
      });
    });
  });
};

var fetchAll = () => {
  board_id = null;
  board_title = "";
  return Ajax.get(window.location.pathname, {"Accept": "application/json"}).then(response => {
    if(response.status == 200) {
      var board = JSON.parse(response.responseText);
      board_id = board.id;
      board_title = board.name;
      // should get columns over action and ajax
      columns = board.columns.sort((a, b) => {
        a.position - b.position;
      });
      stories = board.stories;
      tasks = board.stories.reduce((acc, story) => {
        Array.prototype.push.apply(acc, story.tasks);
        return acc;
      }, []);
    }
  });
};

var initWebsocket = () => {
  var port = (location.port ? ':' + location.port : '');
  var uri = window.location.hostname + port;
  var socket = new WebSocket("ws://" + uri + "/" + board_title + "/ws");
  socket.onmessage = (ws_message) => {
    let con_string = "Connection established";
    var message_data =
      ws_message.data === con_string ? {} : JSON.parse(ws_message.data);
    if (message_data.message) {
      message = message_data.message;
      show_message = true;
      BoardStore.emitChange();
    }
    fetchAll().then(() => {
      BoardStore.emitChange();
    });
  };
};

var updateTask = (data) => {
  return Ajax.postJson('/tasks/' + data.id, data);
};

var addBoard = (board_name) => {
  return Ajax.postJson('/boards', {"name": board_name}).then(response => {
    var response_obj = JSON.parse(response.responseText);
    if (response_obj.success) {
      ErrorActions.removeBoardErrors();
      board_dialog_open = false;
      fetchBoards().then(() => {BoardStore.emitChange();});
    } else {
      var obj_errors = response_obj.messages;
      var error_fields = ErrorFields.BOARD;
      var errors = genErrors(error_fields, obj_errors);
      ErrorActions.addBoardErrors(errors);
    }
  });
};

var addColumn = (column_name) => {
  var data = {"name": column_name, "board_id": BoardStore.getBoardId()};
  Ajax.postJson('/columns', data).then(response => {
    var response_obj = JSON.parse(response.responseText);
    if (response_obj.success) {
      column_dialog_open = false;
      ErrorActions.removeColumnErrors();
    } else {
      var obj_errors = response_obj.messages;
      var error_fields = ErrorFields.COLUMN;
      var errors = genErrors(error_fields, obj_errors);
      ErrorActions.addColumnErrors(errors);
    }
  });
};

var genErrors = (error_fields, obj_errors) => {
  return Object.keys(error_fields).reduce((acc, field) => {
    if (obj_errors[field]) {
      acc[field] = obj_errors[field].join(' ');
    } else {
      acc[field] = '';
    }
    return acc;
  }, {});
};

var addTask = (data) => {
  Ajax.postJson('/tasks', data).then(response => {
    var response_obj = JSON.parse(response.responseText);
    if (response_obj.success) {
      task_dialog_open = false;
    } else {
      var obj_errors = response_obj.messages;
      var error_fields = ErrorFields.TASK;
      var errors = genErrors(error_fields, obj_errors);
      ErrorActions.addTaskErrors(errors);
    }
  });
};

var addStory = (form_values) => {
  return Ajax.postJson('/stories', form_values).then(response => {
    var response_obj = JSON.parse(response.responseText);
    if (response_obj.success) {
      ErrorActions.removeStoryErrors();
      story_edit_dialog_open = false;
    } else {
      var obj_errors = response_obj.messages;
      var error_fields = ErrorFields.STORY;
      var errors = genErrors(error_fields, obj_errors);
      ErrorActions.addStoryErrors(errors);
    }
  });
};

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case "FETCH_ALL":
      fetchAll().then(() => {BoardStore.emitChange();});
      break;
    case "FETCH_BOARD":
      fetchBoard().
        then(() => {BoardStore.emitChange();});
      break;
    case "DELETE_BOARD":
      deleteBoard(action.id);
      break;
    case "DELETE_COLUMN":
      deleteColumn(action.id);
      break;
    case "DELETE_STORY":
      deleteStory(action.id);
      break;
    case "DELETE_TASK":
      deleteTask(action.id);
      break;
    case "FETCH_STORIES":
      fetchStories().
        then(() => {BoardStore.emitChange();});
      break;
    case "FETCH_TASKS":
      fetchTasks().
        then(() => {BoardStore.emitChange();});
      break;
    case "OPEN_STORY_SHOW_DIALOG":
      story_show_dialog_open = true;
      story_show_id = action.story_id;
      BoardStore.emitChange();
      break;
    case "CLOSE_STORY_SHOW_DIALOG":
      story_show_dialog_open = false;
      BoardStore.emitChange();
      break;
    case "OPEN_TASK_SHOW_DIALOG":
      task_show_dialog_open = true;
      task_show_id = action.task_id;
      BoardStore.emitChange();
      break;
    case "CLOSE_TASK_SHOW_DIALOG":
      task_show_dialog_open = false;
      BoardStore.emitChange();
      break;
    case "OPEN_STORY_EDIT_DIALOG":
      story_edit_dialog_open = true;
      BoardStore.emitChange();
      break;
    case "OPEN_STORY_FROM_ISSUE_EDIT_DIALOG":
      story_from_issue_edit_dialog_open = true;
      BoardStore.emitChange();
      break;
    case "CLOSE_STORY_EDIT_DIALOG":
      story_edit_dialog_open = false;
      if (action.reload) {
        fetchAll().then(() => {BoardStore.emitChange();});
      } else {
        BoardStore.emitChange();
      }
      break;
    case "CLOSE_STORY_FROM_ISSUE_EDIT_DIALOG":
      story_from_issue_edit_dialog_open = false;
      if (action.reload) {
        fetchAll().then(() => {BoardStore.emitChange();});
      } else {
        BoardStore.emitChange();
      }
      break;
    case "SHOW_TASK_DIALOG":
      task_dialog_open = true;
      BoardStore.emitChange();
      break;
    case "CLOSE_TASK_DIALOG":
      task_dialog_open = false;
      if (action.reload) {
        fetchAll().then(() => {BoardStore.emitChange();});
      } else {
        BoardStore.emitChange();
      }
      break;
    case "SHOW_COLUMN_DIALOG":
      column_dialog_open = true;
      BoardStore.emitChange();
      break;
    case "CLOSE_COLUMN_DIALOG":
      column_dialog_open = false;
      if (action.reload) {
        fetchAll().then(() => {BoardStore.emitChange();});
      } else {
        BoardStore.emitChange();
      }
      break;
    case "SHOW_TASKS_FOR_STORY_ID":
      //XXX has to be a merge into existing array
      selected_stories = [];
      selected_stories.push(action.story_id);
      BoardStore.emitChange();
      break;
    case "UPDATE_TASK":
      updateTask(action.data);
      break;
    case "OPEN_BOARD_DIALOG":
      board_dialog_open = true;
      BoardStore.emitChange();
      break;
    case "CLOSE_BOARD_DIALOG":
      board_dialog_open = false;
      BoardStore.emitChange();
      break;
    case "FETCH_BOARDS":
      fetchBoards().then(() => {BoardStore.emitChange();});
      break;
    case "ADD_BOARD":
      addBoard(action.data.name);
      break;
    case "ADD_COLUMN":
      addColumn(action.data);
      break;
    case "ADD_TASK":
      addTask(action.data);
      break;
    case "UPDATE_SELECTED_STORY_ID":
      selected_story_id = action.id;
      break;
    case "ADD_STORY":
      addStory(action.data);
      break;
    case "INIT_BOARD":
      fetchAll().then(() => {
        initWebsocket();
        BoardStore.emitChange();
      });
      break;
    case "CLOSE_MESSAGE":
      show_message = false;
      BoardStore.emitChange();
      break;
    default:
      break;
  }
});
module.exports = BoardStore;
