/*jshint esversion: 6 */
// will be removed
/*eslint-disable */
import Konva from 'konva';
import Colors from './color';

class CardGroup extends Konva.Group {
  constructor(card, stage, height, width, margin, type) {

    let card_column = stage.find('Group').filter((group) => {
      if (group.constructor.name == "ColumnGroup" &&
          group.my_attrs.id == card.column_id) {
        return true;
      }
    })[0];

    let cards_on_column = stage.find('Group').filter((group) => {
      if (group.constructor.name == "CardGroup" &&
          group.my_attrs.column_id == card.column_id) {
        return true;
      }
    });

    let card_column_height = card_column.getHeight();
    let cards_on_column_count = cards_on_column.length;
    let card_height_with_margin = height + margin;

    let card_count_per_col = Math.round(card_column_height / card_height_with_margin);

    let card_x_pos = 15 + card_column.position().x;
    let card_y_pos = 30 + (cards_on_column.length * (height + margin));

    if (cards_on_column_count >= card_count_per_col) {
      let move_left_fak = cards_on_column_count / card_count_per_col;
      let  move_left = Math.round(move_left_fak*5);
      card_x_pos = 15 + card_column.position().x - move_left;
      card_y_pos = card_count_per_col * (height + margin) - height + move_left;
    }
    super({
       x: Math.round(card_x_pos),
       y: Math.round(card_y_pos),
       width: width,
       height: height,
       draggable: true,
       dragBoundFunc: function(pos) {
         var x_max = stage.getWidth() - width;
         var y_max = stage.getHeight() - height;
         var x_min = 0;
         var y_min = 5;
         if ((pos.x < x_min && pos.y < y_min) ||
             (pos.x < x_min && pos.y > y_max) ||
             (pos.x > x_max && pos.y < y_min) ||
             (pos.x > x_max && pos.y > y_max)) {
           return {
             x: this.getAbsolutePosition().x,
             y: this.getAbsolutePosition().y
           };
         } else if ((pos.x < x_min && pos.y > y_min) ||
             (pos.x > x_max && pos.y < y_max)) {

           return {
             x: this.getAbsolutePosition().x,
             y: pos.y
           };
         } else if ((pos.x > x_min && pos.y < y_min) ||
             (pos.x < x_max && pos.y > y_max)) {

           return {
             x: pos.x,
             y: this.getAbsolutePosition().y
           };
         } else  if(pos.x > x_min && pos.x < x_max && pos.y > y_min && pos.y < y_max){
           return {
             x: pos.x,
             y: pos.y
           };
         } else {
           return {
             x: this.getAbsolutePosition().x,
             y: this.getAbsolutePosition().y
          };
        }
      }
    });
    this.my_attrs = card;
    this.my_type = type;
  }
}

export default class CardCanvas {
  constructor(card, stage, layout, type) {
    this.card = card;
    this.stage = stage;
    this.card_height = 120;
    this.card_width = 160;
    this.card_margin = 25;
    this.KonvaElement =
      new CardGroup(this.card, this.stage, this.card_height, this.card_width, this.card_margin, type);
    layout.call(this);
  }
}
