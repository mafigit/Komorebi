/*jshint esversion: 6 */
import Konva from 'konva';
import Colors from './color';

class StoryGroup extends Konva.Group {
  constructor(story, stage) {
    let story_column = stage.find('Group').filter((group) => {
      if (group.constructor.name == "ColumnGroup" &&
          group.my_attrs.id == story.column_id) {
        return true;
      }
    })[0];
    super({
       x: 50 + story_column.position().x,
       y: 30,
       width: 250,
       height: 150,
       draggable: true,
       scaleY: 0.5,
       scaleX: 0.5
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
      fill: Colors.green
    });
    this.KonvaElement.add(story_rect);

    var title = new Konva.Text({
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
      fill: Colors.light_red,
      fontSize: 20,
      fontFamily: 'Helvetica',
      fontStyle: 'bold',
      text: story.points
    });
    this.KonvaElement.add(points);
  }
}
export default StoryCanvas;
