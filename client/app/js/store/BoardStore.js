/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
import EventEmitter from 'events';
import assign from 'object-assign';
import Ajax from  'basic-ajax';
import ErrorActions from '../actions/ErrorActions';

var board_id = null;
var board_title = "";
var columns = [];
var stories = [];
var tasks = [];
var tasks_to_display = {};
var selected_stories = [];
var boards = [];

var menu_open = false;
var column_dialog_open = false;
var story_edit_dialog_open = false;
var story_from_issue_edit_dialog_open = false;
var story_show_dialog_open = false;
var task_dialog_open = false;
var board_dialog_open = false;

var story_show_id = null;

var CHANGE_EVENT = 'change';

var BoardStore = assign({}, EventEmitter.prototype, {
  getBoardId: function () {
    return board_id;
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
  getStoryShowId: () => {
    return story_show_id;
  },
  getBoardDialogOpen: () => {
    return board_dialog_open;
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
      // should get columns over action and ajax
      columns = board.columns.sort((a, b) => {
        a.position - b.position;
      });
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
  return new Promise((resolve) => {
    fetchBoard();
    fetchStories().then(fetchTasks).then(resolve);
  });
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
      ErrorActions.addBoardErrors({board_name: response_obj.message});
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
      fetchAll().then(() => {BoardStore.emitChange();});
    } else {
      ErrorActions.addColumnErrors({column_name: response_obj.message});
    }
  });
};

var addStory = (form_values) => {
  return Ajax.postJson('/stories', form_values).then(response => {
    var response_obj = JSON.parse(response.responseText);
    if (response_obj.success) {
      ErrorActions.removeStoryErrors();
      story_edit_dialog_open = false;
      fetchStories().then(() => {BoardStore.emitChange();});
    } else {
      ErrorActions.addStoryErrors({story_name: response_obj.message});
    }
  });
};

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case "FETCH_ALL":
      fetchAll().
        then(() => {BoardStore.emitChange();});
      break;
    case "FETCH_BOARD":
      fetchBoard().
        then(() => {BoardStore.emitChange();});
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
      updateTask(action.data).then(() => {BoardStore.emitChange();});
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
    case "ADD_STORY":
      addStory(action.data);
      break;
    default:
      break;
  }
});
module.exports = BoardStore;
