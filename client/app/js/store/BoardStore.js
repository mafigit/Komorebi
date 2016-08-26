/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
import EventEmitter from 'events';
import assign from 'object-assign';
import Ajax from  'basic-ajax';

var board_id = null;
var board_title = "";
var columns = [];
var stories = [];
var tasks = [];

var menu_open = false;
var column_dialog_open = false;
var story_edit_dialog_open = false;
var story_show_dialog_open = false;
var task_dialog_open = false;

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
  getStories: function() {
    return stories;
  },
  getTasks: function() {
    return tasks;
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
      columns = board.columns;
    }
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
  return new Promise((resolve, reject) => {
    let count = stories.length;
    stories.forEach(function(story) {
      Ajax.get(`/stories/${story.id}/tasks`,
        {"Accept": "application/json"}).then(response => {
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
  return new Promise((resolve, reject) => {
    fetchBoard();
    fetchStories().then(fetchTasks).then(resolve);
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
    case "CLOSE_STORY_EDIT_DIALOG":
      story_edit_dialog_open = false;
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
    default:
      // no op
  }
});
module.exports = BoardStore;
