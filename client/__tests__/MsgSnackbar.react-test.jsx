import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import MsgSnackbar from '../app/js/msg_snackbar';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import MessageStore from '../app/js/store/MessageStore';
injectTapEventPlugin();

describe('<MessageSnackbar />', () => {
  MessageStore.__Rewire__("snackbar", {message: "Hello", open: true});

  it('Should render MsgSnackbar', () => {
    const wrapper = shallow(
      <MsgSnackbar />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

})
