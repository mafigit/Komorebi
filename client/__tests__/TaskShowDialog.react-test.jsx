import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import TaskShowDialog from '../app/js/task_show_dialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import BoardStore from '../app/js/store/BoardStore';
injectTapEventPlugin();

describe('<TaskShowdialog />', () => {
  BoardStore.__Rewire__("tasks", [
    {"id":1,"name":"task1","updated_at":1471541536411708346,"desc":"","story_id":1,"priority":1,"column_id":1,"archived":false,
      "users":[]},
    {"id":2,"name":"task2","updated_at":1471541536411708346,"desc":"","story_id":2,"priority":1,"column_id":1,"archived":false,
      "users":[]},
  ]);

  it('Should render TaskDialog', () => {
    const wrapper = shallow(
      <TaskShowDialog open={true} task_id={1} />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('Should update show dialog on task id', () => {
    const wrapper = mount(
      <TaskShowDialog open={true} task_id={null} />
    );
    wrapper.setProps({task_id: 1});
    expect(wrapper.state().name).toEqual("task1")
    wrapper.setProps({task_id: 2});
    expect(wrapper.state().name).toEqual("task2")
  });

})
