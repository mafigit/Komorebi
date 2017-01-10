import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import ColumnDialog from '../app/js/column_dialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import ErrorActions from '../app/js/actions/ErrorActions';
injectTapEventPlugin();

it('Should render ColumnDialog', () => {
  const wrapper = shallow(
      <ColumnDialog open={false} />
    );
  expect(toJson(wrapper)).toMatchSnapshot();
});

it('Should show Error when Error action is called', () => {
  const wrapper = mount(
    <ColumnDialog open={true} />
  );
  expect(wrapper.state().error.column_name).toEqual("");

  ErrorActions.addColumnErrors({column_name: "Error!"});

  expect(wrapper.state().error.column_name).toEqual("Error!");
});
