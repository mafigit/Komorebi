/*jshint esversion: 6 */
import Konva from 'konva';
import Colors from './color';
import CardCanvas from './card_canvas';

class TaskCanvas extends CardCanvas {
  constructor(task, stage) {
    var layout = function() {
      var card_rect = new Konva.Rect({
        width: this.card_width,
        height: this.card_height,
        fill: Colors.light_green,
        shadowColor: 'black',
        shadowOffsetX: 8,
        shadowOffsetY: 8,
        shadowBlur: 10,
        shadowEnabled: true,
        shadowOpacity: 0.5
      });
      this.KonvaElement.add(card_rect);

      var title = new Konva.Text({
        width: this.card_width,
        height: this.card_height - 105,
        fill: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Helvetica',
        fontStyle: 'bold',
        text: this.card.name
      });
      var new_x_title = card_rect.getWidth()/2 - title.getWidth()/2;
      title.position({x: new_x_title, y: 5});
      this.KonvaElement.add(title);

      var desc = new Konva.Text({
        x: 5,
        y: 50,
        width: 245,
        height: 100,
        fill: 'white',
        fontSize: 12,
        fontFamily: 'Helvetica',
        text: this.card.desc
      });
      this.KonvaElement.add(desc);
    };
    super(task, stage, layout, "task");
  }
}
export default TaskCanvas;
