import React from 'react';
import StoryCard from '../app/js/story_card.jsx';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import BoardStore from '../app/js/store/BoardStore';

test('Render Html with Name', () => {
  const component = shallow(
    <StoryCard name="test" story_id="1"/>
  );
  let tree = toJson(component);
  expect(tree).toMatchSnapshot();
  expect(tree.children.includes('test')).toBeTruthy();
});

test('Click on Story to showTasksForStoryId', () => {
  const component = shallow(
    <StoryCard name="test" story_id="1"/>
  );
  let tree = toJson(component);
  expect(tree).toMatchSnapshot();
  tree.props.onClick();
  expect(BoardStore.getSelectedStories()).toEqual(['1']);

  const component2 = shallow(
    <StoryCard name="test2" story_id="2"/>
  );
  let tree2 = toJson(component2);
  expect(tree2).toMatchSnapshot();
  tree2.props.onClick();
  expect(BoardStore.getSelectedStories()).toEqual(['2']);
});
