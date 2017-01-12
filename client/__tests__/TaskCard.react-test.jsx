import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import TaskCard from '../app/js/task_card.jsx';
import IconButton from 'material-ui/IconButton';
import BoardActions from '../app/js/actions/BoardActions';
import BoardStore  from '../app/js/store/BoardStore';



beforeEach(function() {
  var story1 = {"id":1, "name":"foo"};
  var column1 = {"id":1,"name":"Col1","updated_at":1471541504413505006,"stories":[],"position":1,"board_id":1};
  var column2 = {"id":2,"name":"Col2","updated_at":1471541504413505007,"stories":[],"position":2,"board_id":1};
  BoardStore.__Rewire__('columns', [column1, column2]);
  BoardStore.__Rewire__('stories', [story1]);
});

it('Should update position of task after clicking on next button', () => {
  var column_id = 1;
  const wrapper = shallow(
      <TaskCard
        task_id={1}
        name="test"
        desc="test desc"
        task_priority={1}
        task_story_id ={1}
        column_id={column_id}
      />
    );
  expect(toJson(wrapper)).toMatchSnapshot();

  var new_column_id = column_id + 1;
  var updated_task = {};
  BoardStore.__Rewire__('updateTask', function(data) {
    return new Promise((resolve, reject) => {
      updated_task = data;
      resolve();
    });
  });

  var next_button = wrapper.find(IconButton).find({className: 'nextButton'}).first()
  next_button.simulate('click');
  expect(updated_task.column_id).toEqual(new_column_id);
});
