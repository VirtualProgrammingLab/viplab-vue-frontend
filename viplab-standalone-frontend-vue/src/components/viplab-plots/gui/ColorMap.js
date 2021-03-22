import { Color } from "./Color.js";

export function Colormap(red, green, blue) {
    this.min = 0.0;
    this.max = 1.0;

    this.chash = new Array();
    this.chash.length = 257;

    function computeColor(height) {

    }

    this.toColor = function(height) {
        var hash = 0;

	    if (max > min) {
	        hash = (int)(256.0 * (height - min) / (max - min));
	        if (hash < 0) {
		        hash = 0;
            }
	        if (hash > 256) {
		        hash = 256;
            }
	    }

	    if (chash[hash] == null) {
	        chash[hash] = computeColor((height - min) / (max - min));
        }
	
	    return chash[hash];
    }

    this.setMinMax = function(mn, mx) {
        this.min = mn;
        this.max = mx;
    }

    this.getMin = function() {
        return this.min;
    }

    this.getMax = function() {
        return this.max;
    }
}