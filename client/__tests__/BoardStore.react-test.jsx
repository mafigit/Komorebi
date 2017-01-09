import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import BoardStore  from '../app/js/store/BoardStore';
import AppDispatcher from '../app/js/dispatcher/AppDispatcher';

const test_data = {
  column1: {"id":1,"name":"Col1","updated_at":1471541504413505006,"stories":[],"position":1,"board_id":1},
  column2: {"id":2,"name":"Col2","updated_at":1471541504413505008,"stories":[],"position":2,"board_id":1},
  story1: {"id":1,"name":"Story1","updated_at":1468575129729239946,"desc":"Test","points":4,"priority":1,"requirements":"","column_id":1},
  task1: {"id":1,"name":"Task1","updated_at":0,"desc":"desc","story_id":1,"column_id":1,"priority":4}
}

beforeEach(function() {
  BoardStore.__Rewire__('board_id', 1);
  BoardStore.__Rewire__('board_title', "Test");
  BoardStore.__Rewire__('columns', [test_data.column1, test_data.column2]);
  BoardStore.__Rewire__('stories', [test_data.story1]);
  BoardStore.__Rewire__('tasks', [test_data.task1]);
});

test('Get board_id', () => {
  expect(BoardStore.getBoardId()).toEqual(1);
});

test('Get board_title', () => {
  expect(BoardStore.getBoardTitle()).toEqual("Test");
});

test('Get columns', () => {
  expect(BoardStore.getColumns()).toEqual([test_data.column1, test_data.column2]);
});
