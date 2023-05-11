export default function DataSet(w, h, xmin, xmax, ymin, ymax, time, label) {
  this.data = [];
  this.width = w;
  this.height = h;
  this.xmin = xmin;
  this.xmax = xmax;
  this.ymin = ymin;
  this.ymax = ymax;
  this.time = time;
  this.label = label;

  this.getWidth = function () {
    return this.width;
  };

  this.getHeight = function () {
    return this.height;
  };

  this.getData = function () {
    return this.data;
  };

  this.getXMin = function () {
    return this.xmin;
  };

  this.getXMax = function () {
    return this.xmax;
  };

  this.getYMin = function () {
    return this.ymin;
  };

  this.getYMax = function () {
    return this.ymax;
  };

  this.getXMin = function () {
    return this.xmin;
  };

  this.getTime = function () {
    return this.time;
  };

  this.getXMin = function () {
    return this.xmin;
  };

  this.getLabel = function () {
    return this.label;
  };
}
