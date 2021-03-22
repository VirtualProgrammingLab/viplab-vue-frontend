import { Color } from "../gui/Color.js";
import * as DataSet from "./DataSet.js"
import * as DataSetView from "./DataSetView.js"
import * as GridPanel from "./GridPanel.js"
import * as IOException from "../io/IOException.js"

export function GridPlotParser() {
    
    //ArrayList<Color>
    var min;
    var max;
    
    // Return ArrayList<DataSet>
    // Todo: reader === StringReader
    this.parseFile = function(reader) {
	    var width = 0;
        var height = 0; // Dimensions of the array.
	    var x = 0;
        var y = 0; // scanning positions in the array.
	    var xmin = 0.0;
        var ymin = 0.0;
        var xmax = 0.0;
        var ymax = 0.0; // range on the screen
	    var  xscale = 1.0;
        var yscale = 1.0;
        var zscale = 1.0; // scaling factors

        //ArrayList<DataSet>
	    var tl = new Array();

        //DataSet
	    var d = null;

	    var s;
	    var label = null;
	    var raw   = null;
	    var time  = 0.0;
	    
        //Colors
        var cmin = null;
	    var cmax = null;

        //ArrayList<Color>
	    min = new Array();
	    max = new Array();
	
	
	    do {
	        s = reader.readLine();
	        if (s != null && (!s === ("\n")) && (!s.startsWith("##"))) {
		        if (s.startsWith("#")) {
		            var blank;
		            var args = new Array();
                    
		            // Settings/configuration of the file.
		            s = s.substring(1).trim();
                    
		            blank = s.indexOf(" ");
		            if (blank >= 0) {
			            raw  = s.substring(blank+1).trim();
			            args = raw.split("\\s");
			            s    = s.substring(0,blank);
		            } else {
			            args = new String[0];
			            raw  = "";
		            }
		    
		            // Start a new dataset
		            d = null;
		            x = 0;
		            y = 0;
                    
		            // Now parse off all possible settings.
		            try {
			            if (s.equalsIgnoreCase("x-range")) {
			                xmin = Double.parseDouble(args[0]);
			                xmax = Double.parseDouble(args[1]);
			            } else if (s.equalsIgnoreCase("y-range")) {
			                ymin = Double.parseDouble(args[0]);
			                ymax = Double.parseDouble(args[1]);
			            } else if (s.equalsIgnoreCase("x-count")) {
			                width  = Integer.parseInt(args[0]);
			            } else if (s.equalsIgnoreCase("y-count")) {
			                height = Integer.parseInt(args[0]);
			            } else if (s.equalsIgnoreCase("min-color")) {
			                var r = Integer.parseInt(args[0]);
			                var g = Integer.parseInt(args[1]);
			                var b = Integer.parseInt(args[2]);
			                cmin  = new Color(r,g,b);
			            } else if (s.equalsIgnoreCase("max-color")) {
			                var r = Integer.parseInt(args[0]);
			                var g = Integer.parseInt(args[1]);
			                var b = Integer.parseInt(args[2]);
			                cmax  = new Color(r,g,b);
			            } else if (s.equalsIgnoreCase("scale")) {
			                xscale = Double.parseDouble(args[0]);
			                yscale = Double.parseDouble(args[1]);
			                zscale = Double.parseDouble(args[2]);
			            } else if (s.equalsIgnoreCase("time")) {
			                time = Double.parseDouble(args[0]);
			            } else if (s.equalsIgnoreCase("label")) {
			                label  = raw;
			            } 
		            } catch(aoi) {
                        // Todo: IOException
			            throw new IOException("invalid input format");
		            }
		        } else {
		            var idx = 0;
		            var v = s.split("\\s");
		            // Real data. The least thing we need to have are the dimensions.
		            if (width <= 1 || height <= 1) {
			            throw new IOException("invalid input format, width and height of the array are missing");
                    }
                    if (xmax <= xmin || ymax <= ymin) {
			            throw new IOException("invalid input format, plot range is zero or negative");
		            }                    
                    if (d == null) {
			            d = new DataSet(width,height,xmin,xmax,ymin,ymax,time,label);    
                        tl.add(d);
			            min.add(cmin);
			            max.add(cmax);
			            cmin = null;
			            cmax = null;
		            }
		    
		            try {
			            for(idx = 0;idx < v.length;idx++) {
			                var z = Double.parseDouble(v[idx]);
			                d.getData()[x][y] = z * zscale;
                        
			                x++;
			                if (x >= width) {
				                x = 0;
				                y++;
			                }
			            }
		            } catch(aoi) {
			            throw new IOException("invalid input format, too many samples in the array");
		            }
		        }
            }
	    } while(s != null);

        return tl;
    } 
    
    // Return minimum and maximum color.
    this.getMinColor = function() {
	    return min;
    }

    // Return ArrayList<Color>
    this.getMaxColor = function() {
	    return max;
    }
}