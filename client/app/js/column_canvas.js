/*jshint esversion: 6 */
import Konva from 'konva';
import Colors from './color';

class ColumnCanvas {
  constructor(width, height, title, pos, id) {
    this.pos = pos;
    this.width = width;
    this.height = height;
    this._id = id;
    this.title = title || "Column";
    this.KonvaElement = new Konva.Group({
       x: 2 + this.pos * this.width,
       y: 20,
       width: this.width,
       height: this.height,
       name: "column:" + id
    });

    var column_background = new Konva.Rect({
      width: this.width,
      height: this.height,
      fill: Colors.light_yellow,
      stroke: 'white',
      strokeWidth: 2,
      draggable: false,
      opacity: 1.0
    });

    var text = new Konva.Text({
      x: column_background.getWidth()/2,
      y: column_background.getHeight()/2,
      fill: '#FFFFFF',
      fontSize: 70,
      fontFamily: 'Helvetica',
      fontStyle: 'bold',
      text: this.title,
    });
    var new_x = text.position().x - text.getHeight()/2;
    var new_y = text.position().y + text.getWidth()/2;
    text.position({x: new_x, y: new_y});
    text.rotate(-90);
    this.KonvaElement.add(column_background);
    this.KonvaElement.add(text);
  }
}
export default ColumnCanvas;
