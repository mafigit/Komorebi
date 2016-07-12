/*jshint esversion: 6 */
import Konva from 'konva';
class BoardCanvas {
  constructor(container) {
    this.container = container;
    this.stage = new Konva.Stage({
      container: this.container,
      width: window.innerWidth - 20,
      height: window.innerHeight - 100
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.layer.draw();
    this.createColumns();
  }

  createColumns() {
    var column_height = document.getElementById(this.container).offsetHeight - 30;
    var column = new Konva.Rect({
        x: 0,
        y: 20,
        width: 300,
        height: column_height,
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 4,
        draggable: false,
    });
    this.layer.add(column);
    this.layer.draw();
  }
}
export default BoardCanvas;
