/*jshint esversion: 6 */
import Konva from 'konva';
import Colors from './color';

class StoryGroup extends Konva.Group {
  constructor(story, stage) {
    var scale_factor = stage.getWidth()/1920;
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
    super({
       x: 50 + story_column.position().x,
       y: 30 + (stories_on_column.length * 140),
       width: 250,
       height: 150,
       draggable: true,
       scaleY: scale_factor,
       scaleX: scale_factor,
       dragBoundFunc: function(pos) {
         var x_max = stage.getWidth() - Math.round(250 * scale_factor);
         var y_max = stage.getHeight() - Math.round(150 * scale_factor);
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
    this.KonvaElement = new StoryGroup(story, stage);

    var story_rect = new Konva.Rect({
      width: 250,
      height: 150,
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
      width: 230,
      height: 45,
      fill: '#FFFFFF',
      fontSize: 16,
      fontFamily: 'Helvetica',
      fontStyle: 'bold',
      text: story.name
    });
    var new_x_title = story_rect.getWidth()/2 - title.getWidth()/2;
    title.position({x: new_x_title, y: 5});
    this.KonvaElement.add(title);

    var points = new Konva.Text({
      x: story_rect.getWidth() - 30,
      y: 5,
      fill: Colors.dark_gray,
      fontSize: 20,
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
      fontSize: 16,
      fontFamily: 'Helvetica',
      text: story.desc
    });
    this.KonvaElement.add(desc);
  }
}
export default StoryCanvas;
