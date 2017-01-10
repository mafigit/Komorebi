/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
var BoardActions = {
  fetchBoard: () => {
    AppDispatcher.dispatch({
      actionType: "FETCH_BOARD",
    });
  },
  fetchBoards: () => {
    AppDispatcher.dispatch({
      actionType: "FETCH_BOARDS",
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
    AppDispatcher.dispatch({
      actionType: "REMOVE_TASK_ERRORS"
    });
  },
  openStoryShowDialog: (story_id) =>  {
    AppDispatcher.dispatch({
      actionType: "OPEN_STORY_SHOW_DIALOG",
      story_id: story_id
    });
  },
  closeStoryShowDialog: () =>  {
    AppDispatcher.dispatch({
      actionType: "CLOSE_STORY_SHOW_DIALOG",
    });
  },
  openStoryEditDialog: () =>  {
    AppDispatcher.dispatch({
      actionType: "OPEN_STORY_EDIT_DIALOG"
    });
  },
  openStoryFromIssueEditDialog: () =>  {
    AppDispatcher.dispatch({
      actionType: "OPEN_STORY_FROM_ISSUE_EDIT_DIALOG"
    });
  },
  closeStoryEditDialog: (reload) =>  {
    AppDispatcher.dispatch({
      actionType: "CLOSE_STORY_EDIT_DIALOG",
      reload: reload
    });
  },
  closeStoryFromIssueEditDialog: (reload) =>  {
    AppDispatcher.dispatch({
      actionType: "CLOSE_STORY_FROM_ISSUE_EDIT_DIALOG",
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
  },
  showTasksForStoryId: (story_id) =>  {
    AppDispatcher.dispatch({
      actionType: "SHOW_TASKS_FOR_STORY_ID",
      story_id: story_id
    });
  },
  updateTask: (data) => {
    AppDispatcher.dispatch({
      actionType: "UPDATE_TASK",
      data: data
    });
  },
  openBoardDialog: () => {
    AppDispatcher.dispatch({
      actionType: "OPEN_BOARD_DIALOG"
    });
  },
  closeBoardDialog: () => {
    AppDispatcher.dispatch({
      actionType: "CLOSE_BOARD_DIALOG"
    });
  },
  addBoard: (data) => {
    AppDispatcher.dispatch({
      actionType: "ADD_BOARD",
      data: data
    });
  },
  addColumn: (data) => {
    AppDispatcher.dispatch({
      actionType: "ADD_COLUMN",
      data: data
    });
  },
  addTask: (data) => {
    AppDispatcher.dispatch({
      actionType: "ADD_TASK",
      data: data
    });
  },
  updateSelectedStoryId: (story_id) => {
    AppDispatcher.dispatch({
      actionType: "UPDATE_SELECTED_STORY_ID",
      id: story_id
    });
  },
  addStory: (data) => {
    AppDispatcher.dispatch({
      actionType: "ADD_STORY",
      data: data
    });
  },
  initBoard: () => {
    AppDispatcher.dispatch({
      actionType: "INIT_BOARD"
    });
  },
  closeMessage: () => {
    AppDispatcher.dispatch({
      actionType: "CLOSE_MESSAGE"
    });
  }
};
module.exports = BoardActions;
