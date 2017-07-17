import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import BoardList from '../app/js/board_list';
import BoardStore from '../app/js/store/BoardStore';
injectTapEventPlugin();

describe('<BoardList />', () => {
  BoardStore.__Rewire__('fetchBoards', function() {
    return new Promise((resolve) => {
      resolve();
    });
  });

  it('Should render BoardList', () => {
    const wrapper = mount(
      <BoardList />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
