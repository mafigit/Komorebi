/*jshint esversion: 6 */
import Konva from 'konva';
import Colors from './color';

class StoryGroup extends Konva.Group {
  constructor(story, stage, height, width, margin) {

    let story_column = stage.find('Group').filter((group) => {
      if (group.constructor.name == "ColumnGroup" &&
          group.my_attrs.id == story.column_id) {
        return true;
      }
    })[0];

    let stories_on_column = stage.find('Group').filter((group) => {
      if (group.constructor.name == "StoryGroup" &&
          group.my_attrs.column_id == story.column_id) {
        return true;
      }
    });

    let story_column_height = story_column.getHeight();
    let stories_on_column_count = stories_on_column.length;
    let story_height_with_margin = height + margin;

    let story_count_per_col = Math.round(story_column_height / story_height_with_margin);

    let story_x_pos = 15 + story_column.position().x;
    let story_y_pos = 30 + (stories_on_column.length * (height + margin));

    if (stories_on_column_count >= story_count_per_col) {
      let move_left_fak = stories_on_column_count / story_count_per_col;
      let  move_left = Math.round(move_left_fak*5);
      story_x_pos = 15 + story_column.position().x - move_left;
      story_y_pos = story_count_per_col * (height + margin) - height + move_left;
    }
    super({
       x: Math.round(story_x_pos),
       y: Math.round(story_y_pos),
       width: width,
       height: height,
       draggable: true,
       dragBoundFunc: function(pos) {
         var x_max = stage.getWidth() - width;
         var y_max = stage.getHeight() - height;
         var x_min = 0;
         var y_min = 5;
         if ((pos.x < x_min && pos.y < y_min) ||
             (pos.x < x_min && pos.y > y_max) ||
             (pos.x > x_max && pos.y < y_min) ||
             (pos.x > x_max && pos.y > y_max)) {
           return {
             x: this.getAbsolutePosition().x,
             y: this.getAbsolutePosition().y
           };
         } else if ((pos.x < x_min && pos.y > y_min) ||
             (pos.x > x_max && pos.y < y_max)) {

           return {
             x: this.getAbsolutePosition().x,
             y: pos.y
           };
         } else if ((pos.x > x_min && pos.y < y_min) ||
             (pos.x < x_max && pos.y > y_max)) {

           return {
             x: pos.x,
             y: this.getAbsolutePosition().y
           };
         } else  if(pos.x > x_min && pos.x < x_max && pos.y > y_min && pos.y < y_max){
           return {
             x: pos.x,
             y: pos.y
           };
         } else {
           return {
             x: this.getAbsolutePosition().x,
             y: this.getAbsolutePosition().y
          };
        }
      }
    });
    this.my_attrs = story;
  }
}

class StoryCanvas {
  constructor(story, stage) {
    let story_height = 100;
    let story_width = 150;
    let story_margin = 25;

    this.KonvaElement = new StoryGroup(story, stage, story_height, story_width, story_margin);

    var story_rect = new Konva.Rect({
      width: story_width,
      height: story_height,
      fill: Colors.green,
      shadowColor: 'black',
      shadowOffsetX: 8,
      shadowOffsetY: 8,
      shadowBlur: 10,
      shadowEnabled: true,
      shadowOpacity: 0.5
    });
    this.KonvaElement.add(story_rect);

    var title = new Konva.Text({
      width: story_width - 20,
      height: story_height - 105,
      fill: '#FFFFFF',
      fontSize: 12,
      fontFamily: 'Helvetica',
      fontStyle: 'bold',
      text: story.name
    });
    var new_x_title = story_rect.getWidth()/2 - title.getWidth()/2;
    title.position({x: new_x_title, y: 5});
    this.KonvaElement.add(title);

    var points = new Konva.Text({
      x: story_rect.getWidth() - story_margin,
      y: 5,
      fill: Colors.dark_gray,
      fontSize: 16,
      fontFamily: 'Helvetica',
      fontStyle: 'bold',
      text: story.points
    });
    this.KonvaElement.add(points);

    var desc = new Konva.Text({
      x: 5,
      y: 50,
      width: 245,
      height: 100,
      fill: 'white',
      fontSize: 12,
      fontFamily: 'Helvetica',
      text: story.desc
    });
    this.KonvaElement.add(desc);
  }
}
export default StoryCanvas;
