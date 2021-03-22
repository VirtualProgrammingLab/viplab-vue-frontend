export function Color(red, green, blue) {
    this.r = red;
    this.g = green;
    this.b = blue;

    this.color = rgb(r, g, b);

    this.rgb = function(r, g, b){
        return "rgb("+r+","+g+","+b+")";
    }

    this.getRed = function() {
        console.log(this.r);
        return this.r;
    }

    this.getGreen = function() {
        console.log(this.g);
        return this.g;
    }

    this.getBlue = function() {
        console.log(this.b);
        return this.b;
    }

    this.getColor = function() {
        console.log(this.color);
        return this.color;
    }
}