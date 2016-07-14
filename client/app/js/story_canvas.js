/*jshint esversion: 6 */
import Konva from 'konva';
import Colors from './color';
import CardCanvas from './card_canvas';

class StoryCanvas extends CardCanvas {
  constructor(story, stage) {
    var layout = function() {
      var card_rect = new Konva.Rect({
        width: this.card_width,
        height: this.card_height,
        fill: Colors.green,
        shadowColor: 'black',
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        shadowBlur: 5,
        shadowEnabled: true,
        shadowOpacity: 0.5
      });
      this.KonvaElement.add(card_rect);

      var title = new Konva.Text({
        width: this.card_width - 60,
        height: 30,
        fill: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Helvetica',
        fontStyle: 'bold',
        text: this.card.name
      });
      var new_x_title = card_rect.getWidth()/3 - title.getWidth()/3;
      title.position({x: new_x_title, y: 5});
      this.KonvaElement.add(title);

      var headerLine = new Konva.Line({
        points: [5, 23, (this.card_width - 5), 23],
        stroke: 'white',
        strokeWidth: 1,
      });
      this.KonvaElement.add(headerLine);

      var points = new Konva.Text({
        x: card_rect.getWidth() - this.card_margin,
        y: 5,
        fill: Colors.dark_gray,
        fontSize: 16,
        fontFamily: 'Helvetica',
        fontStyle: 'bold',
        text: this.card.points
      });
      this.KonvaElement.add(points);

      var desc = new Konva.Text({
        x: 5,
        y: 30,
        width: this.card_width - 10,
        height: this.card_height - 35,
        fill: 'white',
        fontSize: 12,
        fontFamily: 'Helvetica',
        text: this.card.desc
      });
      this.KonvaElement.add(desc);
    };
    super(story, stage, layout, "story");
  }
}
export default StoryCanvas;
