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
var users = [];
var selected_story_id = null;
var selected_color = null;
var selected_board_id = null;
var burndown_data = null;
var dod_data = null;
var story_dod_data = null;

var message = "";
var menu_open = false;
var show_user_assign = false;
var show_board_list = false;
var column_dialog_open = false;
var chart_dialog_open = false;
var dod_dialog_open = false;
var story_edit_dialog_open = false;
var dod_check_dialog_open = false;
var story_from_issue_edit_dialog_open = false;
var story_show_dialog_open = false;
var task_show_dialog_open = false;
var task_dialog_open = false;
var board_dialog_open = false;
var user_dialog_open = false;
var show_message = false;
var confirmation_open = false;
var confirmation_callback = null;

var story_show_id = null;
var story_edit_id = null;
var task_show_id = null;
var task_edit_id = null;

var CHANGE_EVENT = 'change';

var BoardStore = assign({}, EventEmitter.prototype, {
  getShowChartDialog: function () {
    return chart_dialog_open;
  },
  getShowDodDialog: function () {
    return dod_dialog_open;
  },
  getBurnDownData: function () {
    return burndown_data;
  },
  getDodData: function () {
    return dod_data;
  },
  getStoryDodData: function () {
    return story_dod_data;
  },
  getShowUserAssign: function() {
    return show_user_assign;
  },
  getShowBoardList: function() {
    return show_board_list;
  },
  getUsers: function() {
    return users;
  },
  getUsersForBoard: function() {
    return users.reduce((acc, user) => {
      if (user.selected) {
        acc.push(user);
      }
      return acc;
    }, []);
  },
  getSelectedStoryId: function () {
    return selected_story_id;
  },
  getSelectedColor: function () {
    return selected_color;
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
    return boards.filter((board) => {
      return !board.private;
    });
  },
  getBoardsWithSelected: function() {
    return boards.map((board) => {
      board.selected = false;
      if (board.id === selected_board_id) {
        board.selected = true;
      }
      return board;
    });
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
    var _task = tasks.find((task) => { return task.id === id; });
    if (_task) {
      var _users = BoardStore.getUsersByTask(_task);
      if (_users.length > 0) {
        _task.user = _users[0];
      }
    }
    return _task;
  },
  getTaskByStoryId: function(story_id) {
    return tasks.reduce((acc, task) => {
      if (task.story_id == story_id) {
        var _users = BoardStore.getUsersByTask(task);
        if (_users.length > 0) {
          task.user = _users[0];
        }
        acc.push(task);
      }
      return acc;
    }, []);
  },
  getMenuOpen: () => {
    return menu_open;
  },
  getConfirmationOpen: () => {
    return confirmation_open;
  },
  getConfirmationCallback: () => {
    return confirmation_callback;
  },
  getColumnDialogOpen: () => {
    return column_dialog_open;
  },
  getStoryEditDialogOpen: () => {
    return story_edit_dialog_open;
  },
  getDodCheckDialogOpen: () => {
    return dod_check_dialog_open;
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
  getStory: () => {
    if (story_edit_id) {
      return stories.find((story) => { return story.id === story_edit_id; });
    } else {
      return null;
    }
  },
  getUsersByTask: (task) => {
    return task.users;
  },
  getBoard: () => {
    return null;
  },
  getTask: () => {
    if (task_edit_id) {
      var _task = tasks.find((task) => { return task.id === task_edit_id; });
      if (_task) {
        var _users = BoardStore.getUsersByTask(_task);
        if (_users.length > 0) {
          _task.user_id = _users[0].id;
        }
      }
      return _task;
    } else {
      return null;
    }
  },
  getTaskShowId: () => {
    return task_show_id;
  },
  getBoardDialogOpen: () => {
    return board_dialog_open;
  },
  getUserDialogOpen: () => {
    return user_dialog_open;
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

var toggleUserById = (user_id) => {
  users = users.map((user) => {
    if (user.id === user_id) {
      if (user.selected) {
        user.selected = false;
      } else {
        user.selected = true;
      }
    }
    return user;
  });
};

var toggleUserByIdAction = (user_id) => {
  toggleUserById(user_id);
  assignUsersToBoard();
};

var assignUsersToBoard = () => {
  var selected_user_ids = users.reduce((acc, user) => {
    if (user.selected) {
      acc.push(user.id);
    }
    return acc;
  }, []);
  if (selected_board_id) {
    let url = `/boards/${selected_board_id}/assign_users`;
    let data = {"user_ids": selected_user_ids};
    return Ajax.postJson(url, data);
  }
};

var fetchUsersByBoardId = (board_id) => {
  return Ajax.getJson('/boards/' + board_id + "/users").then(response => {
    var users_by_board = JSON.parse(response.response);
    users = users.map((user) => {
      user.selected = false;
      return user;
    });
    if (users_by_board.length > 0) {
      users_by_board.forEach((user) => {
        toggleUserById(user.id);
      });
    }
  });
};

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

var fetchUsers = () => {
  return Ajax.getJson('/users').then(response => {
    users = JSON.parse(response.response).map((user) => {
      user.selected = false;
      return user;
    });
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

var fetchBurnDownData = () => {
  var url = `/boards/${board_id}/burndown`;
  return Ajax.get(url, {"Accept": "application/json"}).then(response => {
    if (response.status == 200) {
      burndown_data = JSON.parse(response.responseText);
    }
  });
};

var fetchDodData = () => {
  var url = window.location.pathname + "/dods";
  return Ajax.get(url, {"Accept": "application/json"}).then(response => {
    if (response.status == 200) {
      dod_data = JSON.parse(response.responseText);
    }
  });
};

var fetchStoryDodData = (story_id) => {
  var url = `/stories/${story_id}/dods`;
  return Ajax.get(url, {"Accept": "application/json"}).then(response => {
    if (response.status == 200) {
      story_dod_data = JSON.parse(response.responseText);
    }
  });
};

var clearBurndown = () => {
  var url = `/boards/${board_id}/clear`;
  return Ajax.get(url, {"Accept": "application/json"});
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
  }).then(fetchUsers).then(() => {
    return fetchUsersByBoardId(board_id);
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

var assignUserToTask = (user_id, task) => {
  let url = `/tasks/${task.id}/assign_users`;
  let user_ids = [];
  if (user_id) {
    user_ids.push(user_id);
  }
  let data = {"user_ids": user_ids};
  return Ajax.postJson(url, data);
};

var updateTask = (data) => {
  return new Promise((resolve) => {
    Ajax.postJson('/tasks/' + data.id, data).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        resolve(data);
        task_dialog_open = false;
      } else {
        var obj_errors = response_obj.messages;
        var error_fields = ErrorFields.TASK;
        var errors = genErrors(error_fields, obj_errors);
        ErrorActions.addTaskErrors(errors);
      }
    });
  });
};

var moveColumn = (id, direction) => {
  return new Promise((resolve) => {
    var data = {"direction": direction};
    Ajax.postJson('/columns/' + id + "/move", data).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        resolve(data);
      }
    });
  });
};

var updateDods = (dods) => {
  return new Promise((resolve) => {
    var url = window.location.pathname + "/dods";
    var data = {dods: dods};
    Ajax.postJson(url, data).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        ErrorActions.removeDodErrors();
        resolve(data);
      } else {
        var obj_errors = response_obj.messages;
        var error_fields = ErrorFields.TASK;
        var errors = genErrors(error_fields, obj_errors);
        ErrorActions.addDodErrors(errors);
      }
    });
  });
};

var updateStoryDod = (dods) => {
  return new Promise((resolve) => {
    var url = `/stories/${story_edit_id}/dods`;
    var data = dods;
    Ajax.postJson(url, data).then(response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        dod_check_dialog_open = true;
        BoardStore.emitChange();
        ErrorActions.removeCheckDodErrors();
        resolve(data);
      } else {
        var obj_errors = response_obj.messages;
        var error_fields = ErrorFields.TASK;
        var errors = genErrors(error_fields, obj_errors);
        ErrorActions.addCheckDodErrors(errors);
      }
    });
  });
};

var addBoard = (data) => {
  return Ajax.postJson('/boards', data).then(response => {
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

var addUser = (data) => {
  return Ajax.postJson('/users', data).then(response => {
    var response_obj = JSON.parse(response.responseText);
    if (response_obj.success) {
      ErrorActions.removeUserErrors();
      user_dialog_open = false;
      fetchUsers().then(fetchUsersByBoardId.bind(this, selected_board_id)).then(() => {
        BoardStore.emitChange();
      });
    } else {
      var obj_errors = response_obj.messages;
      var error_fields = ErrorFields.USER;
      var errors = genErrors(error_fields, obj_errors);
      ErrorActions.addUserErrors(errors);
    }
  });
};

var updateStory = (form_values) => {
  var url = `/stories/${story_edit_id}`;
  return Ajax.postJson(url, form_values).then(response => {
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

var addStoryFromIssue = (issue) => {
  var board_id = BoardStore.getBoardId();
  return Ajax.getJson(`/create_story_by_issue/${board_id}/${issue}`).then(
    response => {
      var response_obj = JSON.parse(response.responseText);
      if (response_obj.success) {
        MessageActions.showMessage("Successfully created.");
        ErrorActions.removeStoryIssueErrors();
        story_from_issue_edit_dialog_open = false;
      } else {
        var obj_errors = response_obj.messages;
        var error_fields = ErrorFields.STORY_ISSUE;
        var errors = genErrors(error_fields, obj_errors);
        ErrorActions.addStoryIssueErrors(errors);
      }
    }
  );
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
      story_edit_id = action.story_id;
      story_show_dialog_open = false;
      story_edit_dialog_open = true;
      BoardStore.emitChange();
      break;
    case "OPEN_DOD_CHECK_DIALOG":
      story_edit_id = action.story_id;
      fetchStoryDodData(story_edit_id).then(() => {BoardStore.emitChange();});
      story_show_dialog_open = false;
      dod_check_dialog_open = true;
      BoardStore.emitChange();
      break;
    case "OPEN_STORY_FROM_ISSUE_EDIT_DIALOG":
      story_from_issue_edit_dialog_open = true;
      BoardStore.emitChange();
      break;
    case "CLOSE_STORY_EDIT_DIALOG":
      story_edit_id = null;
      story_edit_dialog_open = false;
      if (action.reload) {
        fetchAll().then(() => {BoardStore.emitChange();});
      } else {
        BoardStore.emitChange();
      }
      break;
    case "CLOSE_DOD_CHECK_DIALOG":
      story_edit_id = null;
      dod_check_dialog_open = false;
      BoardStore.emitChange();
      break;
    case "CLOSE_STORY_FROM_ISSUE_EDIT_DIALOG":
      story_from_issue_edit_dialog_open = false;
      if (action.reload) {
        fetchAll().then(() => {BoardStore.emitChange();});
      } else {
        BoardStore.emitChange();
      }
      break;
    case "CLEAR_BURNDOWN":
      clearBurndown();
      break;
    case "SHOW_TASK_DIALOG":
      task_dialog_open = true;
      task_show_dialog_open = false;
      task_edit_id = action.task_id;
      BoardStore.emitChange();
      break;
    case "CLOSE_TASK_DIALOG":
      task_dialog_open = false;
      task_edit_id = null;
      if (action.reload) {
        fetchAll().then(() => {BoardStore.emitChange();});
      } else {
        BoardStore.emitChange();
      }
      break;
    case "TOGGLE_MENU":
      if (menu_open) {
        menu_open = false;
      } else {
        menu_open = true;
      }
      BoardStore.emitChange();
      break;
    case "SHOW_CHART_DIALOG":
      chart_dialog_open = true;
      fetchBurnDownData().then(() => {BoardStore.emitChange();});
      BoardStore.emitChange();
      break;
    case "SHOW_DOD_DIALOG":
      dod_dialog_open = true;
      fetchDodData().then(() => {BoardStore.emitChange();});
      BoardStore.emitChange();
      break;
    case "CLOSE_CHART_DIALOG":
      chart_dialog_open = false;
      BoardStore.emitChange();
      break;
    case "CLOSE_DOD_DIALOG":
      dod_dialog_open = false;
      BoardStore.emitChange();
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
    case "TOGGLE_TASKS_FOR_STORY_ID":
      var index = selected_stories.indexOf(action.story_id);
      if (index >= 0) {
        selected_stories.splice(index, 1);
      } else {
        selected_stories.push(action.story_id);
      }
      BoardStore.emitChange();
      break;
    case "UPDATE_TASK":
      assignUserToTask(action.data.user_id, action.data).then(updateTask.bind(this, action.data));
      task_dialog_open = false;
      break;
    case "UPDATE_DODS":
      updateDods(action.data).then(fetchDodData());
      break;
    case "MOVE_COLUMN":
      moveColumn(action.id, action.direction).then(
        fetchAll().then(() => {
          BoardStore.emitChange();
        }));
      break;
    case "UPDATE_STORY_DOD":
      updateStoryDod(action.data);
      break;
    case "UPDATE_TASK_POSITION":
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
    case "FETCH_USERS":
      fetchUsers().then(() => {BoardStore.emitChange();});
      break;
    case "ADD_BOARD":
      addBoard(action.data);
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
    case "UPDATE_SELECTED_COLOR":
      selected_color = action.color;
      break;
    case "ADD_STORY":
      addStory(action.data);
      break;
    case "UPDATE_STORY":
      updateStory(action.data);
      break;
    case "ADD_STORY_FROM_ISSUE":
      addStoryFromIssue(action.issue);
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
    case "ADD_USER":
      addUser(action.data);
      break;
    case "OPEN_USER_DIALOG":
      user_dialog_open = true;
      BoardStore.emitChange();
      break;
    case "OPEN_CONFIRMATION":
      confirmation_open = true;
      confirmation_callback = action.callback;
      BoardStore.emitChange();
      break;
    case "CLOSE_CONFIRMATION":
      confirmation_open = false;
      confirmation_callback = null;
      BoardStore.emitChange();
      break;
    case "CLOSE_USER_DIALOG":
      user_dialog_open = false;
      BoardStore.emitChange();
      break;
    case "TOGGLE_USER_BY_ID":
      toggleUserByIdAction(action.user_id);
      BoardStore.emitChange();
      break;
    case "SELECT_BOARD":
      if (selected_board_id !== action.board_id) {
        selected_board_id = action.board_id;
        fetchUsersByBoardId(action.board_id).then(() => {
          BoardStore.emitChange();
        });
      }
      break;
    case "SHOW_USER_ASSIGN":
      show_user_assign = true;
      show_board_list = false;
      selected_board_id = null;
      BoardStore.emitChange();
      break;
    case "SHOW_BOARD_LIST":
      show_user_assign = false;
      show_board_list = true;
      selected_board_id = null;
      BoardStore.emitChange();
      break;
    default:
      break;
  }
});
module.exports = BoardStore;
