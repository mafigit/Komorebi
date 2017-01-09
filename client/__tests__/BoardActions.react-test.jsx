import React from 'react';

import BoardActions  from '../app/js/actions/BoardActions';
import BoardStore  from '../app/js/store/BoardStore';

test('Update task_dialog_open for action showTaskDialog', () => {
  BoardActions.showTaskDialog();
  expect(BoardStore.getTaskDialogOpen()).toBeTruthy();
});

test('Update task_dialog_open for action closeTaskDialog', () => {
  BoardActions.closeTaskDialog();
  expect(BoardStore.getTaskDialogOpen()).toBeFalsy();
});

test('Update story_show_dialog_open for action openStoryShowDialog', () => {
  BoardActions.openStoryShowDialog();
  expect(BoardStore.getStoryShowDialogOpen()).toBeTruthy();
});
