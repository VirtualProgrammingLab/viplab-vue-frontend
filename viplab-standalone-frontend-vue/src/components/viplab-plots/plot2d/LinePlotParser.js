//import * as IOException from "./io/IOException.js"
//import * as DataSet from "./gridplot/DataSet.js"

import { LinePlotFrame } from "./LinePlotFrame";
import { LinePlotGraph } from "./LinePlotGraph";

export function LineParser(viplabFile) {
    this.file = viplabFile;

    this.outputFile = function () {
        console.log(this.file);
    }

    this.parseFileToJson = function () {
        let json = JSON.parse(this.file.replace(/\n/g, "\\n"));
        return json;
    }

    this.parseValues = function (json) {
        let value = json.value.split("\n");

        let frames = [];
        let currentFrame = new LinePlotFrame();
        let currentGraph = new LinePlotGraph();

        for (var i = 0; i < value.length; i++) {
            if (value[i] != null && (!(value[i] === "\n")) && (!(value[i].startsWith("##")))) {
                //if (value[i].startsWith("#")) {
                    

                    var splitLine = value[i].split(" ");
                    if(splitLine[0] == "") {
                        splitLine.splice(0,1); 
                    }
                    //console.log("line length " + splitLine.length + " - " + splitLine);

                    if ((splitLine.length == 1) || (splitLine[0] === "##")) {
                        // do nothing
                    }

                    if (splitLine[0] === "#") {
                        //console.log("starts with #");
                        switch (splitLine[1].toLowerCase()) {
                            case "newframe":
                                
                                // store graph if not empty
                                if (currentGraph.getLinesCount() > 0) {
                                    currentFrame.addGraph(currentGraph);
                                }
                                // store current frame if not empty
                                if (currentFrame.getGraphsCount() > 0) {
                                    frames.push(currentFrame);
                                }

                                // Create a new graph and frame.
                                currentGraph = new LinePlotGraph();
                                currentFrame = new LinePlotFrame();

                                // optional frame duration argument
                                if (splitLine.length == 3) {
                                    currentFrame.setDuration(parseInt(splitLine[2]));
                                }
                                break;
                            case "linestyle":
                                if ((splitLine.length < 2) || splitLine[2] === "none") {
                                    currentGraph.setLinestyle(0);
                                } else if (splitLine[2] === "solid") {
                                    currentGraph.setLinestyle("solid");
                                } else if (splitLine[2] === "dashed") {
                                    currentGraph.setLinestyle("dashed");
                                } else if (splitLine[2] === "dotted") {
                                    currentGraph.setLinestyle("dotted");
                                } else if (splitLine[2] === "dash-dot") {
                                    currentGraph.setLinestyle("dashdot");
                                } else {
                                    console.log("Invalid plot syntax - line plot style invalid - in line " + value[i]);
                                }
                                break;
                            case "color":
                                newColor = "rgb(0,0,0)"; // This is the default color
                                if (splitLine.length == 5) {
                                    let r = parseInt(splitLine[2]);
                                    let g = parseInt(splitLine[3]);
                                    let b = parseInt(splitLine[4]);
                                    newColor = "rgb(" + r + "," + g + "," + b + ")";
                                }
                                // if graph is not empty, store it and create new one
                                if (currentGraph.getLinesCount() > 0) {
                                    currentFrame.addGraph(currentGraph);
                                    currentGraph = new LinePlotGraph();
                                }
                                currentGraph.setColor(newColor);
                                break;
                            case "legend":
                                var choppedLegends = value[i].substring("# legend ".length).split(",");
                                
                                var graphIndex;
                                // add legend to every graph in this frame that still has no legend
                                var numberOfAddedLegends = 0;
                                for (graphIndex = 0; graphIndex < currentFrame.getGraphsCount() && numberOfAddedLegends < choppedLegends.length; graphIndex++) {
                                    
                                    if (currentFrame.getGraph(graphIndex).getLegend() === ("")) {
                                        
                                        currentFrame.getGraph(graphIndex).setLegend(choppedLegends[numberOfAddedLegends]);
                                        numberOfAddedLegends++;
                                    }
                                }
                                // add legend to current graph if necessary
                                if (numberOfAddedLegends < choppedLegends.length) {
                                    currentGraph.setLegend(choppedLegends[numberOfAddedLegends]);
                                }
                                break;
                            case "symbol":
                                if (splitLine[1] === "none") {
                                    currentGraph.setSymbol('\0');
                                } else {
                                    currentGraph.setSymbol(value[i].charAt("# y-label ".length - 1));
                                }
                                break;
                            case "text":
                                var newColor = "rgb(0,0,0)";
                                if (splitLine.length >= 5) {
                                    let textContent;
                                    //let x,y;

                                    //x = parseFloat(splitLine[2]);
                                    //y = parseFloat(splitLine[3]);

                                    textContent = value[i].substring("# text ".length + splitLine[2].length + splitLine[3].length + 2);
                                    currentFrame.addText(textContent);
                                }
                                // if graph is not empty, store it and create new one
                                if (currentGraph.getLinesCount() > 0) {
                                    currentFrame.addGraph(currentGraph);
                                    currentGraph = new LinePlotGraph();
                                }
                                currentGraph.setColor(newColor);
                                break;
                            case "title":
                                currentFrame.setTitle(value[i].substring("# title ".length));
                                break;
                            case "x-label":
                                currentFrame.setLabelX(value[i].substring("# x-label ".length));
                                break;
                            case "y-label":
                                currentFrame.setLabelY(value[i].substring("# y-label ".length));
                                break;
                            case "x-range":
                                currentFrame.setRangeXByUser(parseFloat(splitLine[2]), parseFloat(splitLine[3]));
                                break;
                            case "y-range":
                                currentFrame.setRangeYByUser(parseFloat(splitLine[2]), parseFloat(splitLine[3]));
                                break;
                            case "scale":
                                if (splitLine[2] === "lin-lin") {
                                    currentFrame.setScale(LinePlotFrame.SCALE_LIN_LIN);
                                } else if (splitLine[2] === "log-lin") {
                                    currentFrame.setScale(LinePlotFrame.SCALE_LOG_LIN);
                                } else if (splitLine[2] === "lin-log") {
                                    currentFrame.setScale(LinePlotFrame.SCALE_LIN_LOG);
                                } else if (splitLine[2] === "log-log") {
                                    currentFrame.setScale(LinePlotFrame.SCALE_LOG_LOG);
                                }
                                break;
                            default:
                                console.log("default case");
                        }
                    } else if (splitLine.length == 4) {
                        //console.log("splitLine length 4");
                        // coordinates for the graph
                        let x1 = parseFloat(splitLine[0]);
                        let y1 = parseFloat(splitLine[1]);
                        let x2 = parseFloat(splitLine[2]);
                        let y2 = parseFloat(splitLine[3]);
                        // update min and max values
                        if (!currentFrame.getRangeXsetByUser()) {
                            currentFrame.setRangeX(Math.min(x1, x2), Math.max(x1, x2));
                        }
                        if (!currentFrame.getRangeYsetByUser()) {
                            currentFrame.setRangeY(Math.min(y1, y2), Math.max(y1, y2));
                        }
                        // add line to graph
                        currentGraph.addLine([x1, y1, x2, y2]);
                    }
                //} 
            }
        }

        // add current graph and frame
        if (currentGraph.getLinesCount() > 0) {
            currentFrame.addGraph(currentGraph);
        }

        if (currentFrame.getGraphsCount() > 0) {
            frames.push(currentFrame);
        }

        return frames;
    }

}