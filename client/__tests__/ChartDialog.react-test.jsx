import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import { mount } from 'enzyme';

import ChartDialog from '../app/js/chart_dialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactTestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import BoardStore from '../app/js/store/BoardStore';
injectTapEventPlugin();

describe('<ChartDialog />', () => {
  BoardStore.__Rewire__("burndown_data",
    []
  );
  BoardStore.__Rewire__("chart_dialog_open", true);

  it('Should render ChartDialog', () => {
    const wrapper = shallow(
      <ChartDialog />
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

})
