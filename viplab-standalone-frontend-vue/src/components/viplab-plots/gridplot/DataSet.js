export function DataSet(w, h, xmin, xmax, ymin, ymax, time, label) {
  this.data = new Array();
  this.width = w;
  this.height = h;
  this.xmin = xmin;
  this.xmax = xmax;
  this.ymin = ymin;
  this.ymax = ymax;
  this.time = time;
  this.label = label;

  this.getWidth = function () {
    // console.log(this.width);
    return this.width;
  };

  this.getHeight = function () {
    // console.log(this.height);
    return this.height;
  };

  this.getData = function () {
    // console.log(this.data);
    return this.data;
  };

  this.getXMin = function () {
    // console.log(this.xmin);
    return this.xmin;
  };

  this.getXMax = function () {
    // console.log(this.xmax);
    return this.xmax;
  };

  this.getYMin = function () {
    // console.log(this.xmin);
    return this.xmin;
  };

  this.getYMax = function () {
    // console.log(this.xmax);
    return this.xmax;
  };

  this.getXMin = function () {
    // console.log(this.xmin);
    return this.xmin;
  };

  this.getTime = function () {
    // console.log(this.time);
    return this.time;
  };

  this.getXMin = function () {
    // console.log(this.xmin);
    return this.xmin;
  };

  this.getLabel = function () {
    // console.log(this.label);
    return this.label;
  };
}
