export function LinePlotFrame() {
  this.graphs = []; // LinePlotGraphs
  this.texts = []; // LinePlotTexts

  this.title = '';

  // labels for x and y
  this.labelX = '';
  this.labelY = '';

  // ranges set by user?
  this.rangeXsetByUser = false;
  this.rangeYsetByUser = false;

  // Ranges as currently avaiable.
  this.rangeXmin = Number.POSITIVE_INFINITY;
  this.rangeXpositiveMin = Number.POSITIVE_INFINITY;
  this.rangeXmax = Number.NEGATIVE_INFINITY;
  this.rangeYmin = Number.POSITIVE_INFINITY;
  this.rangeYpositiveMin = Number.POSITIVE_INFINITY;
  this.rangeYmax = Number.NEGATIVE_INFINITY;

  // constants to indicate how the axsis should be scaled
  const SCALE_LIN_LIN = 0;
  const SCALE_LIN_LOG = 1;
  const SCALE_LOG_LIN = 2;
  const SCALE_LOG_LOG = 3;

  // Scaling type (see below)
  this.scale = SCALE_LIN_LIN;

  // Duration in milliseconds when animated.
  this.duration = 250;

  // The number format for nicely formatting numbers.
  // #.###
  // console.log(new Intl.NumberFormat('de-DE').format(3500));
  // → '3.500' wenn in Deutscher Sprache

  // Add a graph to the frame.
  this.addGraph = function (addedGraph) {
    this.graphs.push(addedGraph);
  };

  // return the ith graph of the frame.
  this.getGraph = function (index) {
    return this.graphs[index];
  };

  // return number of graphs
  this.getGraphsCount = function () {
    return this.graphs.length;
  };

  // return all graphs
  this.getAllGraphs = function () {
    return this.graphs;
  };

  // add text
  this.addText = function (text) {
    this.texts.push(text);
  };

  // Return the complete list of texts.
  this.getAllTexts = function () {
    return this.texts;
  };

  // Return the label for the X axis.
  this.getLabelX = function () {
    return this.labelX;
  };

  // Set the label for the X axis.
  this.setLabelX = function (labelX) {
    this.labelX = labelX;
  };

  // Return the label for the Y axis.
  this.getLabelY = function () {
    return this.labelY;
  };

  // Set the label for the Y axis.
  this.setLabelY = function (labelY) {
    this.labelY = labelY;
  };

  // Return the title.
  this.getTitle = function () {
    return this.title;
  };

  // Set the title of the graph.
  this.setTitle = function (title) {
    this.title = title;
  };

  // Install a custom X range.
  this.setRangeX = function (min, max) {
    this.rangeXmin = Math.min(min, this.rangeXmin);
    this.rangeXmax = Math.max(max, this.rangeXmax);

    if (min > 0.0) {
      this.rangeXpositiveMin = Math.min(min, this.rangeXpositiveMin);
    }
  };

  // Install a custom X range, overriding the default one.
  this.setRangeXByUser = function (min, max) {
    if (max > min) {
      this.rangeXmin = min;
      this.rangeXmax = max;
      this.rangeXsetByUser = true;
    }
  };

  // Install a custom Y range.
  this.setRangeY = function (min, max) {
    this.rangeYmin = Math.min(min, this.rangeYmin);
    this.rangeYmax = Math.max(max, this.rangeYmax);

    if (min > 0.0) {
      this.rangeYpositiveMin = Math.min(min, this.rangeYpositiveMin);
    }
  };

  // Install a custom Y range, overriding the one provided by the user.
  this.setRangeYByUser = function (min, max) {
    if (max > min) {
      this.rangeYmin = min;
      this.rangeYmax = max;
      this.rangeYsetByUser = true;
    }
  };

  // Set the type of scaling.
  this.setScale = function (scale) {
    if (scale < SCALE_LIN_LIN || scale > SCALE_LOG_LOG) {
      console.log('Argument scale out of range. Must be in [0, 4].');
    }
    this.scale = scale;
  };

  // Return the current frame duration.
  this.getDuration = function () {
    return this.duration;
  };

  // Set the current frame duration
  this.setDuration = function (duration) {
    if (duration > 0) {
      this.duration = duration;
    }
  };

  // Return a flag whether the X range is customized.
  this.getRangeXsetByUser = function () {
    return this.rangeXsetByUser;
  };

  // Return a flag whether the Y range is customized.
  this.getRangeYsetByUser = function () {
    return this.rangeYsetByUser;
  };

  // Return frame dimensions, X maximum.
  this.getRangeXmax = function () {
    return this.rangeXmax;
  };
  //
  // Return frame dimensions, X minimum.
  this.getRangeXmin = function () {
    return this.rangeXmin;
  };

  // Return frame dimensions, X minimum clamped to zero for logarithmic plots.
  this.getRangeXpositiveMin = function () {
    return this.rangeXpositiveMin;
  };

  // Return frame dimensions, Y maximum.
  this.getRangeYmax = function () {
    return this.rangeYmax;
  };

  // Return frame dimensions, Y minimum.
  this.getRangeYmin = function () {
    return this.rangeYmin;
  };

  // Return frame dimensions, Y minimum clamped to zero for logarithmic plots.
  this.getRangeYpositiveMin = function () {
    return this.rangeYpositiveMin;
  };

  // Return the current type of scaling.
  this.getScale = function () {
    return this.scale;
  };

  // Check wehter the scaling in X direction is logarithmic.
  this.isXScaleLogarithmic = function () {
    return (this.scale == SCALE_LOG_LIN) || (this.scale == SCALE_LOG_LOG);
  };

  // Check whether the scaling in Y direction is logarithmic.
  this.isYScaleLogarithmic = function () {
    return (this.scale == SCALE_LIN_LOG) || (this.scale == SCALE_LOG_LOG);
  };
}
