/*jshint esversion: 6 */
import AppDispatcher from '../dispatcher/AppDispatcher';
var BoardActions = {
  fetchBoard: () => {
    AppDispatcher.dispatch({
      actionType: "FETCH_BOARD",
    });
  },
  deleteBoard: (id) => {
    AppDispatcher.dispatch({
      actionType: "DELETE_BOARD",
      id: id
    });
  },
  deleteColumn: (id) => {
    AppDispatcher.dispatch({
      actionType: "DELETE_COLUMN",
      id: id
    });
  },
  deleteStory: (id) => {
    AppDispatcher.dispatch({
      actionType: "DELETE_STORY",
      id: id
    });
    AppDispatcher.dispatch({
      actionType: "CLOSE_STORY_SHOW_DIALOG",
    });
  },
  deleteTask: (id) => {
    AppDispatcher.dispatch({
      actionType: "DELETE_TASK",
      id: id
    });
    AppDispatcher.dispatch({
      actionType: "CLOSE_TASK_SHOW_DIALOG",
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
  showTaskDialog: (task_id) =>  {
    AppDispatcher.dispatch({
      actionType: "SHOW_TASK_DIALOG",
      task_id: task_id
    });
  },
  showChartDialog: () =>  {
    AppDispatcher.dispatch({
      actionType: "SHOW_CHART_DIALOG"
    });
  },
  closeChartDialog: () =>  {
    AppDispatcher.dispatch({
      actionType: "CLOSE_CHART_DIALOG",
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
  openTaskShowDialog: (task_id) =>  {
    AppDispatcher.dispatch({
      actionType: "OPEN_TASK_SHOW_DIALOG",
      task_id: task_id
    });
  },
  closeTaskShowDialog: () =>  {
    AppDispatcher.dispatch({
      actionType: "CLOSE_TASK_SHOW_DIALOG",
    });
  },
  openStoryEditDialog: (story_id) =>  {
    AppDispatcher.dispatch({
      actionType: "OPEN_STORY_EDIT_DIALOG",
      story_id: story_id
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
  updateStory: (data) => {
    AppDispatcher.dispatch({
      actionType: "UPDATE_STORY",
      data: data
    });
  },
  addStoryFromIssue: (form_values) => {
    AppDispatcher.dispatch({
      actionType: "ADD_STORY_FROM_ISSUE",
      issue: form_values.issue
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
  },
  addUser: (data) => {
    AppDispatcher.dispatch({
      actionType: "ADD_USER",
      data: data
    });
  },
  openUserDialog: () => {
    AppDispatcher.dispatch({
      actionType: "OPEN_USER_DIALOG"
    });
  },
  closeUserDialog: () => {
    AppDispatcher.dispatch({
      actionType: "CLOSE_USER_DIALOG"
    });
  },
  fetchUsers: () => {
    AppDispatcher.dispatch({
      actionType: "FETCH_USERS"
    });
  },
  showUserAssign: () => {
    AppDispatcher.dispatch({
      actionType: "SHOW_USER_ASSIGN"
    });
  },
  showBoardList: () => {
    AppDispatcher.dispatch({
      actionType: "SHOW_BOARD_LIST"
    });
  },
  toggleUserById: (user_id) => {
    AppDispatcher.dispatch({
      user_id: user_id,
      actionType: "TOGGLE_USER_BY_ID"
    });
  },
  selectBoard: (board_id) => {
    AppDispatcher.dispatch({
      board_id: board_id,
      actionType: "SELECT_BOARD"
    });
  }
};
module.exports = BoardActions;
