/*
 * @Author: wuchenguang1998
 * @Date: 2024-07-28 22:00:00
 * @LastEditors: wuchenguang1998
 * @LastEditTime: 2024-07-28 23:00:00
 * @Description: 矩形元素，圆角属性适配元素放缩影响
 */
import * as fabric from 'fabric';

class FabricRect extends fabric.Rect {
  type = 'rect';
  initialize = function (options) {
    options || (options = {});
    this.callSuper('initialize', options);
  };
  _render(ctx) {
    const roundValue = this.roundValue || 0;
    this.rx = (1 / this.scaleX) * roundValue;
    this.ry = (1 / this.scaleY) * roundValue;
    this.callSuper('_render', ctx);
  }
  fromObject = function (object, callback) {
    return fabric.FabricObject._fromObject('Rect', object, callback);
  };
}

export default FabricRect;
