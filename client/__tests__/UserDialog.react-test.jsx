import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';


import FlatButton from 'material-ui/FlatButton';
import UserDialog from '../app/js/board_dialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import ErrorActions from '../app/js/actions/ErrorActions';
injectTapEventPlugin();

it('Should render UserDialog', () => {
  const wrapper = shallow(
      <UserDialog open={false} />
    );
  expect(toJson(wrapper)).toMatchSnapshot();
});
