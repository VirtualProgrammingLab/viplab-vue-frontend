import { Color } from "../Color.js";
import * as DataSet from "./DataSet.js"
import * as DataSetView from "./DataSetView.js"
import * as GridPanel from "./GridPanel.js"

//p is a GridPlot
export function GridPlotAnimtion(p) {
    // The GridPlot we are part of.
    this.parent = p;

    // Inidicator whether the animation is running. 
    //boolean
    var running = false;

    // Start the animation.
    this.startAnimation = function() {
	    if (!running) {
	        running = true;
	        //todo: Schedules a timer to elapse in the future
            //schedule(1000);
	    }
    }

    // Stop the animation
    this.stopAnimation = function() {
	    running = false;
    }

    // Returns whether the animation is currently active.
    this.isActive = function() {
	    return running;
    }

    // The timer event - proceed to the next iteration.
    this.run = function() {
	    if (running) {
            //DataSet
	        var next = parent.getNextSet();

	        if (next != null) {
		        parent.replotDataSet(next);
                //todo: Schedules a timer to elapse in the future
		        //schedule(1000);
	        }
	    }
    }
}