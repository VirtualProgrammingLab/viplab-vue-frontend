import { map } from "jquery";
import * as ataset from "./DataSet.js";
import * as color from "../gui/Color.js";
import * as colormap from "../gui/ColorMap.js";

export function DataSetView() {
    this.xscale;
    this.yscale;
    this.xoffset;
    this.yoffset;
    
    this.nominal_xmin;
    this.nominal_ymin;
    
    this.nominal_xstep;
    this.nominal_ystep;
    
    this.map;
    
    this.framecolor;
    
    this.labelcolor;
    
    this.MAXTICKLENGTH = 32;
    
    this.ticklength;
    
    this.drawleftticks;
    this.drawbottomticks;
    
    this.labelformat;

    this.labelcolor = new color(0,0,0);

    this.drawleftticks = true;
    this.drawbottomticks = true;

    // todo
    this.labelformat = "";

    this.fitInto = function(width, height, xmin, ymin, xmax, ymax, cwidth, cheight) {
        // Compute the extended boundary area which is extended by half a cell width in each direction.
        var ext_xmin = -0.5;
        var ext_xmax = width  - 0.5;
        var ext_ymin = -0.5;
        var ext_ymax = height - 0.5;
        // Scales from the index domain to the data domain.
        var x_scale  = (xmax - xmin) / width;
        var y_scale  = (ymax - ymin) / height;
        var scale;
        // Compute the extended range in the data domain.
        var d_width  = (ext_xmax - ext_xmin) * x_scale;
        var d_height = (ext_ymax - ext_ymin) * y_scale;
        // Record the nominal origin.
        this.nominal_xmin    = xmin;
        this.nominal_ymin    = ymin;
        this.nominal_xstep   = (xmax - xmin) / width;
        this.nominal_ystep   = (ymax - ymin) / height;
        // Compute the scaling in x and y direction from the data domain to the image
        // domain such that the data fits entirely to the window.
        this.drawleftticks   = false;
        this.drawbottomticks = false;

        if (labelcolor != null) {
            // Compute a useful tick size. For that, first compute a preliminary scale.
            xscale = cwidth  / d_width;
            yscale = cheight / d_height;
            
            // Take the minimum scale to fit entirely into the window while keeping
            // the aspect ratio intact.
            scale = (xscale < yscale)?(xscale):(yscale);
            
            // Finally, we need to use this scale factor to get a scaling from the
            // index domain to the window domain.
            xscale = scale * d_width  / (ext_xmax - ext_xmin);
            yscale = scale * d_height / (ext_ymax - ext_ymin);
            
            // Update the tick dimensions.
            this.ticklength = MAXTICKLENGTH;
            if (xscale * 0.5 < this.ticklength) {
                this.ticklength  = 0.5 * xscale;
            }
            if (yscale * 0.5 < this.ticklength) {
                this.ticklength  = 0.5 * yscale;
            }

            // Now potentially reduce the canvas size so the ticks fit in.
            if (cwidth > 2.0 * this.ticklength) {
                cwidth  -= this.ticklength;
                this.drawleftticks = true;
            }
            if (cheight > 2.0 * this.ticklength) {
                cheight -= this.ticklength;
                this.drawbottomticks = true;
            }
        }

        // Recompute the scales with the possibly adjusted canvas size.
        xscale = cwidth  / d_width;
        yscale = cheight / d_height;

        // Take the minimum scale to fit entirely into the window while keeping
        // the aspect ratio intact.
        scale  = (xscale < yscale)?(xscale):(yscale);

        // Finally, we need to use this scale factor to get a scaling from the
        // index domain to the window domain.
        xscale  =  scale * d_width  / (ext_xmax - ext_xmin);
        yscale  = -scale * d_height / (ext_ymax - ext_ymin);

        // Add an offset so the figuers are centered.
        var mx = cwidth  - 1 - xscale * (ext_xmax - ext_xmin);
        var my = cheight - 1 - xscale * (ext_xmax - ext_xmin);
        if (mx < 0.0) {
            mx = 0.0;
        }
        if (my < 0.0) {
            my = 0.0;
        }

        // Compute the offset such that the upper left edge of the rectangle starts
        // at the lower left corner, i.e. at (0,dim.height-1).
        this.xoffset = -ext_xmin * xscale + mx / 2.0;
        this.yoffset = -ext_ymin * yscale + cheight - 1 - my / 2.0;

        // Add the tickwidth so the ticks are visible.
        if (this.drawleftticks) {
            this.xoffset += this.ticklength;
        }
    }

    this.shift = function(dx, dy) {
        this.xoffset += dx;
        this.yoffset += dy;
    }

    this.scale = function (factor) {
        this.xscale *= factor;
        this.yscale *= factor;
    }

    this.setColormap = function (m) {
        this.map = m;
    }

    this.getColormap = function () {
        return map;
    }

    this.setFrameColor = function (fc) {
        this.framecolor = fc;
    }

    this.setLabelColor = function (lc) {
        this.labelcolor = lc;
    }

    this.render = function (ctx, d) {
       
	var x,y;
	var width  = d.getWidth();
	var height = d.getHeight();
	var data = d.getData();

	if (this.map == null) {
	    ctx.fillStyle("grey");
	}

	for(y = 0;y < height;y++) {
	    for(x = 0;x < width;x++) {
		var x1   = ((x - 0.5) * xscale + xoffset);
		var x2   = ((x + 0.5) * xscale + xoffset);
		var y1   = ((y - 0.5) * yscale + yoffset);
		var y2   = ((y + 0.5) * yscale + yoffset);
		var xmin = (x1 < x2)?(x1):(x2);
		var ymin = (y1 < y2)?(y1):(y2);
		var xmax = (x1 < x2)?(x2):(x1);
		var ymax = (y1 < y2)?(y2):(y1);
		var v = data[x][y];

		if (map != null) 
		    ctx.fillStyle(map.toColor(v).getColor());
		    ctx.fillRect(xmin,ymin,xmax - xmin,ymax - ymin);
	    }
	}
	
	if (framecolor != null) {
	    ctx.setStrokeStyle(framecolor.getColor());
	    ctx.beginPath();
	    for(y = 0;y < height;y++) {
		for(x = 0;x < width;x++) {
		    var x1   = ((x - 0.5) * xscale + xoffset);
		    var x2   = ((x + 0.5) * xscale + xoffset);
		    var y1   = ((y - 0.5) * yscale + yoffset);
		    var y2   = ((y + 0.5) * yscale + yoffset);
		    var xmin = (x1 < x2)?(x1):(x2);
		    var ymin = (y1 < y2)?(y1):(y2);
		    var xmax = (x1 < x2)?(x2):(x1);
		    var ymax = (y1 < y2)?(y2):(y1);
		    var v = data[x][y];

		    ctx.rect(xmin,ymin,xmax - xmin,ymax - ymin);
		}
	    }
	    ctx.stroke();
	}
	//
	// Paint the legend on the left and bottom
	if (labelcolor != null) {
	    ctx.strokeStyle(labelcolor.getColor());
	    ctx.fillStyle(labelcolor.getColor());
	    // On the left.
	    if (drawleftticks) {
		for(y = 0;y < height;y++) {
		    var x1 = -0.5 * xscale + xoffset;
		    var x2 = x1 - ticklength;
		    var y1 = ((y      ) * yscale + yoffset);
		    var v  = nominal_ymin + y * nominal_ystep;
		    ctx.beginPath();
		    ctx.moveTo(x1,y1);
		    ctx.lineTo(x2,y1);
		    ctx.stroke();
		    ctx.closePath();
		    ctx.fillText(labelformat.format(v),x2,y1);
		}
	    }
	    // On the bottom.
	    if (drawbottomticks) {
		for(x = 0;x < width;x++) {
		    var x1 = ((x      ) * xscale + xoffset);
		    var y1 = - 0.5 * yscale + yoffset;
		    var y2 = y1 + ticklength;
		    var v  = nominal_xmin + x * nominal_xstep;
		    ctx.beginPath();
		    ctx.moveTo(x1,y1);
		    ctx.lineTo(x1,y2);
		    ctx.stroke();
		    ctx.closePath();
		    ctx.fillText(labelformat.format(v),x1,y2);
		}
	    }
	}
    }


}