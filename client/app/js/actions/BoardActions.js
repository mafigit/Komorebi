/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
var BoardActions = {
  fetchBoard: () => {
    AppDispatcher.dispatch({
      actionType: "FETCH_BOARD",
    });
  },
  fetchStories: () =>  {
    AppDispatcher.dispatch({
      actionType: "FETCH_STORIES",
    });
  },
  fetchTasks: () => {
    AppDispatcher.dispatch({
      actionType: "FETCH_TASKS",
    });
  },
  fetchAll: () =>  {
    AppDispatcher.dispatch({
      actionType: "FETCH_ALL",
    });
  },
  showTaskDialog: () =>  {
    AppDispatcher.dispatch({
      actionType: "SHOW_TASK_DIALOG"
    });
  },
  closeTaskDialog: (reload) =>  {
    AppDispatcher.dispatch({
      actionType: "CLOSE_TASK_DIALOG",
      reload: reload
    });
  },
  openStoryShowDialog: (story_id) =>  {
    AppDispatcher.dispatch({
      actionType: "OPEN_STORY_SHOW_DIALOG",
      story_id: story_id
    });
  },
  closeStoryShowDialog: (reload) =>  {
    AppDispatcher.dispatch({
      actionType: "CLOSE_STORY_SHOW_DIALOG",
    });
  },
  openStoryEditDialog: () =>  {
    AppDispatcher.dispatch({
      actionType: "OPEN_STORY_EDIT_DIALOG"
    });
  },
  closeStoryEditDialog: (reload) =>  {
    AppDispatcher.dispatch({
      actionType: "CLOSE_STORY_EDIT_DIALOG",
      reload: reload
    });
  },
  showColumnDialog: () =>  {
    AppDispatcher.dispatch({
      actionType: "SHOW_COLUMN_DIALOG"
    });
  },
  closeColumnDialog: (reload) =>  {
    AppDispatcher.dispatch({
      actionType: "CLOSE_COLUMN_DIALOG",
      reload: reload
    });
  }
};
module.exports = BoardActions;
