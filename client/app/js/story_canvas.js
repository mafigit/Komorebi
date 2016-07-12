/*jshint esversion: 6 */
import Konva from 'konva';
import Colors from './color';

class StoryCanvas {
  constructor(pos_y, height, _id, column_id, board_objects) {
    this._id = _id;
    var columns = board_objects.columns;
    var column = columns.filter((el) => {return el._id == column_id})[0];
    var col_pos = column.KonvaElement.position();
    var story = new Konva.Rect({
          x: 50 + col_pos.x,
          y: pos_y,
          width: 150,
          height: height,
          fill: Colors.green,
          draggable: true,
          name: 'story:' + _id
        });
    this.KonvaElement = story;
  }
}
export default StoryCanvas;
