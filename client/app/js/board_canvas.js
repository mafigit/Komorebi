/*jshint esversion: 6 */
import Konva from 'konva';
import ColumnCanvas from './column_canvas';
import StoryCanvas from './story_canvas';
import TaskCanvas from './task_canvas';

class BoardCanvas {
  constructor(container, columns, stories, tasks, handler) {
    let scale_factor = (window.innerWidth - 20)/window.screen.availWidth;
    let card_sorter = function(a, b) {
      if (a.priority < b.priority)
        return -1;
      if (a.priority > b.priority)
        return 1;
      return 0;
    };

    this.container = container;
    this.handler = handler;
    this.stage = new Konva.Stage({
      container: this.container,
      width: window.innerWidth - 20,
      height: window.innerHeight - 100,
      scaleY: scale_factor,
      scaleX: scale_factor
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.layer.draw();
    this.columns = columns;
    this.stories = stories.sort(card_sorter);
    this.tasks = tasks.sort(card_sorter);
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
      var _target = event.target;
      _target.moveTo(this.layer);
      var drop_element = shape.parent;
      if (drop_element && _target) {
        let column_id = 0;
        if (drop_element.constructor.name == "ColumnGroup") {
          column_id = drop_element.my_attrs.id;
        } else {
          column_id = drop_element.my_attrs.column_id;
        }
        this.handler[_target.my_type](_target.my_attrs, column_id);
        this.handler.reload();
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
    var column_canvas_elements = [];
    var column_count = this.columns.length;
    var column_width =
      Math.round(this.stage.getWidth()/column_count);
    var column_height = this.stage.getHeight();
    this.columns.forEach((column) => {
      var column_canvas =
        new ColumnCanvas(column_width, column_height, column);
      this.layer.add(column_canvas.KonvaElement);
    });
    this.stories.forEach((story) => {
      var story_tasks = this.tasks.reduce((acc, task) => {
        if (task.story_id == story.id) {
          acc = task.tasks;
        }
        return acc;
      }, []);
      story_tasks.forEach((task) => {
        var task_canvas = new TaskCanvas(task, this.stage);
        this.layer.add(task_canvas.KonvaElement);
      });
      var story_canvas = new StoryCanvas(story, this.stage,
        this.handler.open_story_view);
      this.layer.add(story_canvas.KonvaElement);
    });
    this.layer.draw();
  }
}
export default BoardCanvas;
