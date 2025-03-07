/*/

/*/

/**/

export class AbstractView {

  constructor(parentView, x, y, width, height, penColor, bkColor) {
    this.id = 'AbstractView';

    this.app = null;
    this.parentView = parentView;
    if (this.parentView != null) {
      this.screen = this.parentView.screen;
      this.app = this.parentView.screen.app;
    }

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.bkColor = bkColor;
    this.penColor = penColor;

    this.parentX = 0;
    this.parentY = 0;
    this.parentWidth = width;
    this.parentHeight = height;

    this.views = [];
  } // constructor

  addView(view) {
    this.views.push(view);
  } // addView

  paint(x, y, width, height, color) {
    this.screen.ctx.fillStyle = color;
    var w = width;
    if (this.x+x < 0) {
      w = w+this.x;
      x = -this.x;
      if (w < 0) {
        w = 0;
      }
    }
    if (x < 0) {
      w = w+x;
      x = 0;
      if (w < 0) {
        w = 0;
      }
    }
    if (this.x+x+w > this.parentWidth) {
      w = this.parentWidth-this.x-x;
      if (w < 0) {
        w = 0;
      }
    }
    if (x+w > this.width) {
      w = this.width-x;
      if (w < 0) {
        w = 0;
      }
    }
    var h = height;
    if (this.y+y < 0) {
      h = h+this.y;
      y = -this.y;
      if (h < 0) {
        h = 0;
      }
    }
    if (y < 0) {
      h = h+y;
      y = 0;
      if (h < 0) {
        h = 0;
      }
    }
    if (this.y+y+h > this.parentHeight) {
      h = this.parentHeight-this.y-y;
      if (h < 0) {
        h = 0;
      }
    }
    if (y+h > this.height) {
      h = this.height-y;
      if (h < 0) {
        h = 0;
      }
    }
    if (w > 0 && h > 0) {
      this.app.canvas.paintRect(this.screen, this.parentX+this.x+x, this.parentY+this.y+y, w, h);
    }
  } // paint

  drawView() {
    if (this.bkColor !== false) {
      this.paint(0, 0, this.width, this.height, this.bkColor);
    }

    this.views.forEach ((view) => {
      view.parentX = this.parentX+this.x;
      view.parentY = this.parentY+this.y;
      
      var w = this.width;
      if (this.x+this.width > this.parentWidth) {
        w = this.parentWidth-this.x;
        if (w < 0) {
          w = 0;
        }
      }
      var h = this.height;
      if (this.y+this.height > this.parentHeight) {
        h = this.parentHeight-this.y;
        if (h < 0) {
          h = 0;
        }
      }
      view.parentWidth = w;
      view.parentHeight = h;
      view.drawView();
    });
  } // drawView

  colorByName(colorName) {
    return this.app.colorByName(colorName);
  } // colorByName
  
  color(color) {
    return this.app.colorByName(color);
  } // color

  penColorByAttribut(attr) {
    return this.app.penColorByAttribut(attr);
  } // penColorByAttribut

  bkColorByAttribut(attr) {
    return this.app.bkColorByAttribut(attr);
  } // bkColorByAttribut

  hexToBin(hexData) {
    return this.hexToInt(hexData).toString(2).padStart(8, '0');
  } // hexToBin

  hexToInt(hexData) {
    return parseInt(hexData, 16);
  } // hexToInt

} // class AbstractView

export default AbstractView;
