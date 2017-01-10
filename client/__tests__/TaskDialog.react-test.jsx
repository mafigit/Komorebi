import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import TaskDialog from '../app/js/task_dialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import ErrorActions from '../app/js/actions/ErrorActions';
injectTapEventPlugin();

it('Should render TaskDialog', () => {
  const wrapper = shallow(
    <TaskDialog open={false} />
  );
  expect(toJson(wrapper)).toMatchSnapshot();
});

it('Should show Error when Error action is called', () => {
  const wrapper = shallow(
    <TaskDialog open={true} />
  );
  expect(wrapper.state().error.name).toEqual("");
  expect(wrapper.state().error.desc).toEqual("");
});
