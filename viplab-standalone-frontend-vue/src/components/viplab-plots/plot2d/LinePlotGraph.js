export default function LinePlotGraph() {
  // The color of this graph, in CSS notation.
  this.color = 'rgb(0, 0, 0)';

  // The array of lines of this graph.
  this.lines = [];

  // Line styles
  // const LINE_NONE     = 0;
  // const LINE_SOLID    =  "solid";
  // const LINE_DASHED   = 2;
  // const LINE_DOTTED   = 3;
  // const LINE_DASH_DOT = 4;

  // The line style to draw the line in.
  this.linestyle = 'solid';

  // The symbol to draw at the line ends. If any...
  this.symbol = '.';

  // The legend of the line, if any.
  this.legend = '';

  // Add a new line to the graph.
  this.addLine = function addLine(input) {
    this.lines.push(input);
  };

  // retrieve all lines as parsed from input
  this.getLines = function () {
    return this.lines;
  };

  // Set color, to be called by the parser
  this.setColor = function (color) {
    this.color = color;
  };

  // Return the color of the graph.
  this.getColor = function () {
    return this.color;
  };

  // Set the line style.
  this.setLinestyle = function (linestyle) {
    this.linestyle = linestyle;
  };

  // Return the line style.
  this.getLinestyle = function () {
    return this.linestyle;
  };

  // Define the legend
  this.setLegend = function (legend) {
    this.legend = legend;
  };

  // Return the legend.
  this.getLegend = function () {
    return this.legend;
  };

  // Return the symbol at line ends.
  this.getSymbol = function () {
    return this.symbol;
  };

  // Set the symbol at line ends.
  this.setSymbol = function (symbol) {
    this.symbol = symbol;
  };

  // Return the number of lines.
  this.getLinesCount = function () {
    return this.lines.length;
  };
}
