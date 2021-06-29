export function LinePlotFrame() {
    let graphs = []; //LinePlotGraphs
    let texts = []; //LinePlotTexts

    let title = "";

    // labels for x and y
    let labelX = "";
    let labelY = "";

    // ranges set by user?
    let rangeXsetByUser = false;
    let rangeYsetByUser = false;

    // Ranges as currently avaiable.
    let rangeXmin = Number.POSITIVE_INFINITY;
    let rangeXpositiveMin = Number.POSITIVE_INFINITY;
    let rangeXmax = Number.NEGATIVE_INFINITY;
    let rangeYmin = Number.POSITIVE_INFINITY;
    let rangeYpositiveMin = Number.POSITIVE_INFINITY;
    let rangeYmax = Number.NEGATIVE_INFINITY;

    // constants to indicate how the axsis should be scaled
    const SCALE_LIN_LIN = 0;
    const SCALE_LIN_LOG = 1;
    const SCALE_LOG_LIN = 2;
    const SCALE_LOG_LOG = 3;

    // Scaling type (see below)
    let scale = SCALE_LIN_LIN;

    // Duration in milliseconds when animated.
    let duration = 250;

    // The number format for nicely formatting numbers.
    // #.###
    // console.log(new Intl.NumberFormat('de-DE').format(3500));
    // → '3.500' wenn in Deutscher Sprache

    // Add a graph to the frame.
    this.addGraph = function(addedGraph) {
        graphs.push(addedGraph);
    }

    // return the ith graph of the frame.
    this.getGraph = function(index) {
        return graphs[index];
    }

    // return number of graphs
    this.getGraphsCount = function() {
        return graphs.length;
    }

    // return all graphs
    this.getAllGraphs = function() {
        return graphs;
    }

    // add text
    this.addText = function(text) {
        texts.push(text);
    }

    // Return the complete list of texts.
    this.getAllTexts = function() {
        return texts;
    }

    // Return the label for the X axis.
    this.getLabelX = function() {
        return labelX;
    }

    // Set the label for the X axis.
    this.setLabelX = function(labelX) {
        this.labelX = labelX;
    }

    // Return the label for the Y axis.
    this.getLabelY = function() {
        return labelY;
    }

    // Set the label for the Y axis.
    this.setLabelY = function(labelY) {
        this.labelY = labelY;
    }

    // Return the title.
    this.getTitle = function() {
        return title;
    }

    // Set the title of the graph.
    this.setTitle = function(title) {
        this.title = title;
    }

    // Install a custom X range.
    this.setRangeX = function(min, max) {
        rangeXmin = Math.min(min, rangeXmin);
        rangeXmax = Math.max(max, rangeXmax);
        
        if (min > 0.0) {
            rangeXpositiveMin = Math.min(min, rangeXpositiveMin);
        }
    }

    // Install a custom X range, overriding the default one.
    this.setRangeXByUser = function(min, max) {
        if (max > min) {
            rangeXmin = min;
            rangeXmax = max;
            rangeXsetByUser = true;
        }
    }

    // Install a custom Y range.
    this.setRangeY = function(min, max) {
        rangeYmin = Math.min(min, rangeYmin);
        rangeYmax = Math.max(max, rangeYmax);
        
        if (min > 0.0) {
            rangeYpositiveMin = Math.min(min, rangeYpositiveMin);
        }
    }

    // Install a custom Y range, overriding the one provided by the user.
    this.setRangeYByUser = function(min, max) {
        if (max > min) {
            rangeYmin       = min;
            rangeYmax       = max;
            rangeYsetByUser = true;
        }
    }

    // Set the type of scaling.
    this.setScale = function(scale) {
        if (scale < SCALE_LIN_LIN || scale > SCALE_LOG_LOG) {
            console.log("Argument scale out of range. Must be in [0, 4].");
        }
        this.scale = scale;
    }

    // Return the current frame duration.
    this.getDuration = function() {
        return duration;
    }

    // Set the current frame duration
    this.setDuration = function(duration) {
        if (0 < duration) {
            this.duration = duration;
        }
    }

    // Return a flag whether the X range is customized.
    this.getRangeXsetByUser = function() {
        return rangeXsetByUser;
    }

    // Return a flag whether the Y range is customized.
    this.getRangeYsetByUser = function() {
        return rangeYsetByUser;
    }

    // Return frame dimensions, X maximum.
    this.getRangeXmax = function() {
        return rangeXmax;
    }
    //
    // Return frame dimensions, X minimum.
    this.getRangeXmin = function() {
        return rangeXmin;
    }

    // Return frame dimensions, X minimum clamped to zero for logarithmic plots.
    this.getRangeXpositiveMin = function() {
        return rangeXpositiveMin;
    }

    // Return frame dimensions, Y maximum.
    this.getRangeYmax = function() {
        return rangeYmax;
    }

    // Return frame dimensions, Y minimum.
    this.getRangeYmin = function() {
        return rangeYmin;
    }

    // Return frame dimensions, Y minimum clamped to zero for logarithmic plots.
    this.getRangeYpositiveMin = function() {
        return rangeYpositiveMin;
    }

     // Return the current type of scaling.
    this.getScale = function() {
        return scale;
    }

    // Check wehter the scaling in X direction is logarithmic.
    this.isXScaleLogarithmic = function() {
        return (scale == SCALE_LOG_LIN) || (scale == SCALE_LOG_LOG);
    }

    // Check whether the scaling in Y direction is logarithmic.
    this.isYScaleLogarithmic = function() {
        return (scale == SCALE_LIN_LOG) || (scale == SCALE_LOG_LOG);
    }
}