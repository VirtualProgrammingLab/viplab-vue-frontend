import { Color } from "../gui/Color.js";
import * as DataSet from "./DataSet.js"
import * as DataSetView from "./DataSetView.js"
import * as GridPanel from "./GridPanel.js"

export function GridPlot(c, d, min, max) {
    
    //ArrayList<DataSet>
    this.data = d;

    //canvas
    this.canvas = c;
    
    //ColorLabelPanel
    var label;

    //ArrayList<String>
    var labels;

    //ArrayList<Color>
    this.colorMin = min;
    this.colorMax = max;

    //double
    var start_time;
    var end_time;
    var current_time;

    //ListBox
    var labelbox;

    //TimeControl
    var timectrl;

    var current_label;

    //DataSetView
    var view;

    //GridPlotAnimation
    this.animation = new GridPlotAnimation(this);

    //VerticalPanel from GWT : How to supplement?
    this.vpanel = new VerticalPanel();
    vpanel.setWidth("100%");
	vpanel.setHeight("100%");
	vpanel.getElement().getStyle().setProperty("backgroundColor","LightGray");
    vpanel.add(c);

    findLabels();
    findTimes();

    // Select the first panel and make it active.
	if (d.size() > 0) {
	    current_time  = d.get(0).getTime();
	    current_label = d.get(0).getLabel();
	    view          = new DataSetView();
	    view.setColormap(buildColormap(current_label));
	    view.setFrameColor(new Color(0,0,0));
	    
	    panel = new GridPanel(canvas,d.get(0),view);
	    label = new ColorLabelPanel();
	    label.setOutlineColormap(view.getColormap());
	} else {
	    label = null;
	}
	
	// Add a label selection combo box?
	if (labels != null) {
	    labelbox = new ListBox();
	    for(label in labels) {
		    labelbox.addItem(label);
	    }
	    labelbox.setVisibleItemCount(1);
	    labelbox.addChangeHandler(this);
	    vpanel.add(labelbox);
	}
	
	// Add a timer selection box.
	if (start_time < end_time) {
	    timectrl = new TimeControl(current_time);
	    timectrl.addActionListener(this);
	    vpanel.add(timectrl);
	} else {
	    timectrl = null;
	}

    //Return a GWT Widget
    this.getGUI = function() {
	    return vpanel;
    }

    // Find the list of available labels, construct the label array.
    this.findLabels = function() {
	    var label = null;
	    this.labels = new Array();

	    for(d in data) {
	        label = d.getLabel();
	        if (label == null) { 
		        label = "";
            }
	        if (!labels.contains(label)) {
		        labels.add(label);
            }
	    }
	
	    // Remove the list if there is only a single label in it.
	    if (labels.size() < 1) {
	        labels = null;
	    }
    } 

    // Find start and end time.
    this.findTimes = function() {
	    var min =  Number.MAX_VALUE;
	    var max = -Number.MAX_VALUE;

	    for(d in data) {
	        var time = d.getTime();
	        if (time < min) {
		        min = time;
            }
	        if (time > max) {
		        max = time;
            }
	    }

	    if (min <= max) {
	        start_time   = min;
	        end_time     = max;
	        current_time = min;
	    }
    }

    // Build a suitable colormap for the view given a label.
    // Return Colormap
    this.buildColormap = function(label) {
	    var min =  Number.MAX_VALUE;
	    var max = -Number.MAX_VALUE;

        //Colormap
	    var map;

        //Color
	    var cmin = null;
	    var cmax = null;

	    var idx = 0;
	
	    for(d in data) {
	        if (label == null || label === (d.getLabel())) {
		        var width  = d.getWidth();
		        var height = d.getHeight();
		        var x,y;
		        var dt = d.getData();
		
		        // Extract the min/max colors from the color array.
		        if (cmin == null && cmax == null && idx < colorMin.size() && idx < colorMax.size()) {
		            cmin = colorMin.get(idx);
		            cmax = colorMax.get(idx);
		        }
		
		        for(y = 0; y < height; y++) {
		            for(x = 0; x < width; x++) {
			            var v = dt[x][y];
			            if (v < min) {
			                min = v;
                        }
			            if (v > max) {
			                max = v;
                        }
		            }
		        }
            }
        }
	
        if (cmin != null & cmax != null) {
	        map = new RGBInterpolatingMap(cmin,cmax);
	    } else {
	        map = new DefaultMap();
	    }

	    map.setMinMax(min,max);

	    return map;
    }

    // Find the first plot, i.e. the plot using the same label having the smallest
    // possible time. 
    // Return DataSet
    this.getFirstSet = function() {
	    var min = Number.MAX_VALUE;

        //DataSet
	    var minarg = null;

	    for(d in data) {
	        if (current_label == null || current_label === (d.getLabel())) {
		        if (d.getTime() < min) {
		            min = d.getTime();
		            minarg = d;
		        }
	        }
	    }

	    return minarg;
    }

    // Find the last plot, i.e. the plot using the same label having the smallest
    // possible time. 
    this.getLastSet = function() {
	    var max     = -Number.MAX_VALUE;

        //DataSet
	    var maxarg = null;

	    for(d in data) {
	        if (current_label == null || current_label === (d.getLabel())) {
		        if (d.getTime() > max) {
		            max = d.getTime();
		            maxarg = d;
		        }
	        }
	    }

	    return maxarg;
    }

    // Find the previous plot, i.e. the plot having the largest time smaller than
    // the current time.
    this.getPrevSet = function() {	
	    var max = -Number.MAX_VALUE;

        //DataSet
	    var maxarg = null;

	    for(d in data) {
	        if (current_label == null || current_label === (d.getLabel())) {
		        if (d.getTime() > max && d.getTime() < current_time) {
		            max = d.getTime();
		            maxarg = d;
		        }
	        }
	    }

	    return maxarg;
    }

    // Find the next plot, i.e. the plot having the smallest time larger than the
    // current time.
    // Return DataSet
    this.getNextSet = function() {
	    var min = Number.MAX_VALUE;

        //DataSet
	    var minarg = null;

	    for(d in data) {
	        if (current_label == null || current_label === (d.getLabel())) {
		        if (d.getTime() < min && d.getTime() > current_time) {
		            min = d.getTime();
		            minarg = d;
		        }
	        }
	    }

	    return minarg;
    }

    // Find the dataset that is closest to the current time having the
    // same label as the given one, or any label if the given label is
    // null.
    // Return DataSet
    this.getNamedSet = function(label) {
	    var min = Number.MAX_VALUE;
	    var minarg = null;

	    for(d in data) {
	        if (label == null || label === (d.getLabel())) {
		        var time = d.getTime();
		        if (time >= current_time) {
		            time  = time - current_time;
		        } else {
		            time  = current_time - time;
		        }
		        if (time < min) {
		            min = time;
		            minarg = d;
		        }
	        }
	    }
        return minarg;
    }

    // Change the data for the grid view given the argument, ignore
    // and do nothing if the argument is null.
    this.replotDataSet = function(nd) {
	    if (nd != null) {
	        current_time  = nd.getTime();
	        current_label = nd.getLabel();
	    
	        timectrl.setTime(current_time);
	        panel.setData(nd);
	        paintPlot(canvas);
	    }
    }

    // Render the plot itself into the given graphics.
    this.paintPlot = function(canvas) {
	    var w = canvas.getElement().getClientWidth();
	    var h = canvas.getElement().getClientHeight();

	    if (w > 0 && h > 0 && data != null) {
	        var ctx = canvas.getContext("2d");
	        canvas.width = w;
	        canvas.height = h;
	        // Fill the canvas.
	        ctx.fillStyle(CssColor.make("White"));
	        ctx.fillRect(0,0,w,h);
	    
	        // Allocate space for the label.
	        if (label != null) {
		        var lwidth = label.getLegendWidth();
		        if (w < 256) {
		            lwidth = w / 8;
                }
		        if (lwidth > 8) {
		            label.render(ctx,lwidth - 4,h,w - lwidth + 4);
		            w -= lwidth;
		        }
	        }
	    
	        // Render the rest of the graphics.
	        if (panel != null) {
		        panel.render(w,h);
	        }
	    }
    }

    this.onResize = function() {
	    if (panel != null) {
	        panel.onResize();
	    }
    } 
    
    // Called when the label box changes.
    this.onChange = function(ch) { 
	    var idx = labelbox.getSelectedIndex();
	    var newlbl = labels.get(idx);
	    var data  = getNamedSet(newlbl);

	    animation.stopAnimation();
	
	    if (data != null) {	
	        view.setColormap(buildColormap(newlbl));
	        replotDataSet(data);
	    }
    }

    // Called when the time control panel triggers.
    this.actionPerformed = function(ae) {
	    if ("play".equals(ae.getActionCommand())) {
	        // Play is a toggle on-off
	        // and handled separately.
	        if (animation.isActive()) {
		        animation.stopAnimation();
	        } else {
		        animation.startAnimation();
	        }
	    } else {
	        animation.stopAnimation();

	        if ("first" === (ae.getActionCommand())) {
		        replotDataSet(getFirstSet());
	        } else if ("prev" === (ae.getActionCommand())) {
		        replotDataSet(getPrevSet());
	        } else if ("next" === (ae.getActionCommand())) {
		        replotDataSet(getNextSet());
	        } else if ("last" === (ae.getActionCommand())) {
		        replotDataSet(getLastSet());
	        }
	    }
    }

    // This returns the minimum required height for the GUI of the
    // frontend, or a negative number in case the GUI size is not
    // yet available.
    this.getMinimumRequiredHeight = function() {
	    if (vpanel != null) {
	        var height = 0;
	        if (timectrl != null) {
		        var h = timectrl.getElement().getClientHeight();
		        if (h <= 0) {
		            return -1;
                }
		        height += h;
	        }
	        if (labelbox != null) {
		        var h = labelbox.getElement().getClientHeight();
		        if (h <= 0) {
		            return -1;
                }
		        height += h;
	        }

	        return height;
	    } else {
	        // Height not yet available.
	        return -1;
	    }
    }

    // Return the size of the legend.
    this.getLegendWidth = function() {
	    return 0;
    }
    
    // Draw the legend.
    this.paintLegend = function(g) {
    }
}