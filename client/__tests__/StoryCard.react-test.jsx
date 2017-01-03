import React from 'react';
import StoryCard from '../app/js/story_card.jsx';
import renderer from 'react-test-renderer';
import BoardStore from '../app/js/store/BoardStore';

test('Render Html with Name', () => {
  const component = renderer.create(
    <StoryCard name="test" story_id="1"/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  expect(tree.children.includes('test')).toBeTruthy();
});

test('Click on Story to showTasksForStoryId', () => {
  const component = renderer.create(
    <StoryCard name="test" story_id="1"/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  tree.props.onClick();
  expect(BoardStore.getSelectedStories()).toEqual(['1']);

  const component2 = renderer.create(
    <StoryCard name="test2" story_id="2"/>
  );
  let tree2 = component2.toJSON();
  expect(tree2).toMatchSnapshot();
  tree2.props.onClick();
  expect(BoardStore.getSelectedStories()).toEqual(['2']);
});
