import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';


import FlatButton from 'material-ui/FlatButton';
import BoardDialog from '../app/js/board_dialog';
import Dialog from 'material-ui/Dialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import ErrorActions from '../app/js/actions/ErrorActions'
injectTapEventPlugin();

it('Should render BoardDialog', () => {
  const wrapper = shallow(
      <BoardDialog open={false} />
    );
  expect(toJson(wrapper)).toMatchSnapshot();
});

it('Should show Error when Error action is called', () => {
  const wrapper = mount(
    <BoardDialog open={true} />
  );
  expect(wrapper.state().error.board_name).toEqual("");

  ErrorActions.addBoardErrors({board_name: "Error!"});

  expect(wrapper.state().error.board_name).toEqual("Error!");
});
