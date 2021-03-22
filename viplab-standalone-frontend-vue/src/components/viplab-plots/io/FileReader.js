export function StringReader(sin) {
    this.input = sin;
    this.offset = 0;
    this.lenght = this.input.lenght;

    // Read a line from the input string.
    // Return String
    this.readLine = function() {
	    var result;
	    var eol = input.indexOf('\n', offset);

	    if (eol >= 0) {
	        // The resulting string does not include the line termination.
	        result = input.substring(offset,eol);
	        offset = eol + 1;
	        return result;
	    } else {
	        // No line found, end of file.
	        return null;
	    }
    }

    // Return the current position in the stream.
    this.note = function() {
	    return offset;
    }

    // Set the offset in the stream.
    this.point = function(offset) {
	    this.offset = offset;
    }
}