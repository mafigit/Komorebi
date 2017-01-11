import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import Sidebar from '../app/js/sidebar';
import BoardStore from '../app/js/store/BoardStore';
import BoardActions from '../app/js/actions/BoardActions';

injectTapEventPlugin();

const test_data = {
  story1: {"id":1,"name":"Story1","updated_at":1468575129729239946,"desc":"Test","points":4,"priority":1,"requirements":"","column_id":1},
};

describe('<Sidebar />', () => {
  BoardStore.__Rewire__('stories', [test_data.story1]);
  it('Should render Sidebar', () => {
    const wrapper = shallow(
      <Sidebar />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('Should update active story', () => {
    const wrapper = mount(
      <Sidebar />
    );
    expect(wrapper.state().selected_stories).toEqual([]);
    BoardActions.showTasksForStoryId(1);
    expect(wrapper.state().selected_stories).toEqual([1]);
  });
});
