import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';

import BoardActions from '../app/js/actions/BoardActions';
import BoardStore  from '../app/js/store/BoardStore';
import Board  from '../app/js/board';

beforeEach(function() {
  BoardStore.__Rewire__('story_show_id', 1);
});

it('Should render', () => {
  const wrapper = shallow(
    <Board />
  );
  expect(toJson(wrapper)).toMatchSnapshot();
});
