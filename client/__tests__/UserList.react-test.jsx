import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import UserList from '../app/js/user_list';
import BoardStore from '../app/js/store/BoardStore';
import BoardActions from '../app/js/actions/BoardActions';
import {List, ListItem} from 'material-ui/List';
injectTapEventPlugin();

const test_data = {
  user1: {"id":1, "name":"Franz", "image_path":"/public/images/franz.jpg", "selected": false},
  user2: {"id":2, "name":"Peter", "image_path":"/public/images/peter.jpg", "selected": false}
};

describe('<UserList />', () => {
  BoardStore.__Rewire__('users', [test_data.user1, test_data.user2]);
  it('Should render UserList', () => {
    const wrapper = mount(
      <UserList />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('Should update user list on click', () => {
    const wrapper = mount(
      <UserList />
    );
    const node = ReactDOM.findDOMNode(
      ReactTestUtils.findRenderedDOMComponentWithClass(
        wrapper.instance(), 'user_0'
      )
    );
    ReactTestUtils.Simulate.click(node);
    expect(wrapper.state().users[0].selected).toEqual(true);
    expect(wrapper.state().users[1].selected).toEqual(false);

    const node2 = ReactDOM.findDOMNode(
      ReactTestUtils.findRenderedDOMComponentWithClass(
        wrapper.instance(), 'user_1'
      )
    );
    ReactTestUtils.Simulate.click(node2);
    expect(wrapper.state().users[0].selected).toEqual(true);
    expect(wrapper.state().users[1].selected).toEqual(true);
  });
});
