/*jshint esversion: 6 */
import Konva from 'konva';
import Colors from './color';

class ColumnGroup extends Konva.Group {
  constructor(width, height, column) {
    super({
      x: 2 + column.position * width,
      y: 20,
      width: width,
      height: height,
    });
    this.my_attrs = column;
  }
}

class ColumnCanvas {
  constructor(width, height, column) {
    this.KonvaElement = new ColumnGroup(width, height, column);
    var column_background = new Konva.Rect({
      width: width,
      height: height,
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
      text: column.name,
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
