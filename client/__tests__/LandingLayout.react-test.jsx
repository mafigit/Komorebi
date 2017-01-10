import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import LandingLayout from '../app/js/landing_layout.jsx';
import BoardStore  from '../app/js/store/BoardStore';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';

injectTapEventPlugin();

beforeEach(function() {
  var column1 = {"id":1,"name":"Col1","updated_at":1471541504413505006,"stories":[],"position":1,"board_id":1};
  var column2 = {"id":2,"name":"Col2","updated_at":1471541504413505007,"stories":[],"position":2,"board_id":1};
  BoardStore.__Rewire__('columns', [column1, column2]);
  BoardStore.__Rewire__('fetchBoards', function() {
    return new Promise((resolve) => {
      resolve();
    });
  });
});

it('Should render Landing Layout', () => {
  const wrapper = shallow(
      <LandingLayout />
    );
  expect(toJson(wrapper)).toMatchSnapshot();
});

it('Should open Menu on Click of menu button', () => {
  const wrapper = mount(
    <LandingLayout />
  );
  expect(wrapper.state().menu_open).toEqual(false);
  const node = ReactDOM.findDOMNode(
    ReactTestUtils.findRenderedDOMComponentWithTag(
      wrapper.instance(), 'button'
    )
  );
  ReactTestUtils.Simulate.touchTap(node);
  expect(wrapper.state().menu_open).toEqual(true);
});
