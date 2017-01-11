import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import StoryFromIssueEditDialog from '../app/js/story_from_issue_edit_dialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import BoardStore from '../app/js/store/BoardStore';
injectTapEventPlugin();

describe('<StoryShowdialog />', () => {
  it('Should render TaskDialog', () => {
    const wrapper = shallow(
      <StoryFromIssueEditDialog open={true} />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
})
