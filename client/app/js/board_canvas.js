/*jshint esversion: 6 */
import Konva from 'konva';
import ColumnCanvas from './column_canvas';

class BoardCanvas {
  constructor(container, columns) {
    this.container = container;
    this.stage = new Konva.Stage({
      container: this.container,
      width: window.innerWidth - 20,
      height: window.innerHeight - 100
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.layer.draw();
    this.columns = columns;
    this.createColumns();
  }

  createColumns() {
    var column_count = this.columns.length;
    var column_width =
      Math.round(this.stage.attrs.width/column_count);
    var column_height =
      document.getElementById(this.container).offsetHeight - 30;
    this.columns.forEach((column, pos) => {
      var column_canvas =
        new ColumnCanvas(column_width, column_height, column.name, pos);
      this.layer.add(column_canvas.KonvaElement);
    });
    this.layer.draw();
  }
}
export default BoardCanvas;
