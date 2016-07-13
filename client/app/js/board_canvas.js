/*jshint esversion: 6 */
import Konva from 'konva';
import ColumnCanvas from './column_canvas';
import StoryCanvas from './story_canvas';

class BoardCanvas {
  constructor(container, columns, stories, handler) {
    this.container = container;
    this.handler = handler;
    this.stage = new Konva.Stage({
      container: this.container,
      width: window.innerWidth - 20,
      height: window.innerHeight - 100
    });
    this.board_objects = {
      columns: [],
      stories: []
    };
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.layer.draw();
    this.columns = columns;
    this.stories = stories;
    this.createColumns();
    var tempLayer = new Konva.Layer();
    this.stage.add(tempLayer);

    this.stage.on("dragstart", (e) => {
      e.target.moveTo(tempLayer);
      this.layer.draw();
    });

    this.stage.on("dragend", (event) => {
      var pos = this.stage.getPointerPosition();
      var shape = this.layer.getIntersection(pos);
      event.target.moveTo(this.layer);
      var ref_str_target = event.target.getName();
      var ref_str_drop = shape.parent.getName();
      if (ref_str_drop && ref_str_target) {
        var story = this.explodeRefStr(ref_str_target);
        var column = this.explodeRefStr(ref_str_drop);
        this.handler.story(story, column);
      }
    });
  }

  explodeRefStr(ref_str) {
    return {
      type: ref_str.split(":")[0],
      _id: ref_str.split(":")[1]
    };
  }

  createColumns() {
    var column_count = this.columns.length;
    var column_width =
      Math.round(this.stage.attrs.width/column_count);
    var column_height =
      document.getElementById(this.container).offsetHeight - 30;
    this.columns.forEach((column, pos) => {
      var column_canvas =
        new ColumnCanvas(column_width, column_height, column.name, pos, column.id);
      this.layer.add(column_canvas.KonvaElement);
      this.board_objects.columns.push(column_canvas);
    });
    var story_pos_y = 30;
    var story_height = 100;
    this.stories.forEach((story) => {
      var story_canvas = new StoryCanvas(story_pos_y, story_height, story.id, story.column_id, this.board_objects);
      this.layer.add(story_canvas.KonvaElement);
      this.board_objects.stories.push(story_canvas);
    });
    this.layer.draw();
  }
}
export default BoardCanvas;
