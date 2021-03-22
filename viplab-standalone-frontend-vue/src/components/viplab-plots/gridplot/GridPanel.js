import { Color } from "../gui/Color.js";
import * as DataSet from "./DataSet.js"
import * as DataSetView from "./DataSetView.js"

export function GridPanel(c, d, v) {
    this.data = d;
    this.view = v;
    this.canvas = c;
    this.buttons;
    this.sx;
    this.sy;
    this.width;
    this.height;
    this.resize = true;

    this.c.addEventListener("mousedown", MouseDownHandler, false);
    this.c.addEventListener("mouseup", MouseUpHandler, false);
    this.c.addEventListener("mousemove", MouseMoveHandler, false);

    // IE9, Chrome, Safari, Opera
    this.c.addEventListener("mousewheel", MouseWheelHandler, false);
    // Firefox
    this.c.addEventListener("DOMMouseScroll", MouseWheelHandler, false);

    function MouseDownHandler(e) {
        e.preventDefault();
        this.buttons = e.button;
        this.sx = e.clientX;
        this.sy = e.clientY;
    }

    function MouseUpHandler(e) {
        var up = e.button;
        e.preventDefault();
        this.buttons &= ~up;
    }

    function MouseMoveHandler(e) {
        var nx = e.clientX;
        var ny = e.clientY;

        e.preventDefault();

        if(nx != this.sx || ny != this.sy) {
            if((this.buttons & (e.button === 0 | e.button === 2)) != 0) {
                this.view.shift(nx - this.sx, ny - this.sy);

                // todo:
                // AnimationScheduler.get().requestAnimationFrame(this,canvas.getElement());
                
                this.sx = nx;
		        this.sy = ny;
            }
        }
    }

    function MouseWheelHandler(e) {
        // cross-browser wheel delta
        var e = window.event || e; // old IE support
        var notches = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        if (notches > 0.0) {
            while (notches > 0.0) {
                this.view.scale(1.1);
                notches--;
            }
        } else {
            while (notches < 0.0) {
                this.view.scale(1.0/1.1);
                notches++;
            }
        }
        // todo: 
        // AnimationScheduler.get().requestAnimationFrame(this,canvas.getElement());
    }

    this.onResize = function() {
        this.resize = true;
        this.paint();
    }

    this.paint = function() {
        if (this.width > 0 && this.height > 0 && this.data != null) {
            var ctx = canvas.getContext("2d");
            //
            if (this.resize) {
            // Adjust the view to fit into the canvas.
            this.view.fitInto(this.data.getWidth(), this.data.getHeight(),
                     this.data.getXMin(), this.data.getYMin(),
                     this.data.getXMax(), this.data.getYMax(),
                     this.width, this.height);
            this.resize = false;
            }
            
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle(new Color(255, 255, 255).rgb(255, 255, 255));
            ctx.globalAlpha(0.0);
            ctx.rect(0,0,width,height);
            ctx.stroke();
            ctx.closePath();
            ctx.clip();
            ctx.globalAlpha(1.0);
    
            ctx.fillStyle(CssColor.make("White"));
            ctx.fillRect(0,0,width,height);
            
            view.render(ctx,data);
    
            ctx.restore();
        }
    }

    this.execute = function(timestamp) {
	    paint();
    }

    this.render = function(width, height) {
	    this.width  = width;
	    this.height = height;

	    paint();
    }

    this.setData = function(d) {
	    this.data = d;
    } 

    this.setFrameColor = function(c) {
	    this.view.setFrameColor(c);
    }
}