import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import StoryShowDialog from '../app/js/story_show_dialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import BoardStore from '../app/js/store/BoardStore';
injectTapEventPlugin();

describe('<StoryShowdialog />', () => {
  BoardStore.__Rewire__("stories", [
    {"id":1,"name":"test1","updated_at":1471541541313618701,"desc":"","points":5,"priority":1,"requirements":"Do_this!","column_id":3,"tasks":[],"position":1,"board_id":1},
    {"id":2,"name":"test2","updated_at":1471541541313618700,"desc":"","points":5,"priority":1,"requirements":"Do_this!","column_id":3,"tasks":[],"position":1,"board_id":1},
  ]);

  it('Should render TaskDialog', () => {
    const wrapper = shallow(
      <StoryShowDialog open={true} story_id={1} />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('Should update show dialog on story id', () => {
    const wrapper = mount(
      <StoryShowDialog open={true} story_id={null} />
    );
    wrapper.setProps({story_id: 1});
    expect(wrapper.state().name).toEqual("test1")
    wrapper.setProps({story_id: 2});
    expect(wrapper.state().name).toEqual("test2")
  });

})
