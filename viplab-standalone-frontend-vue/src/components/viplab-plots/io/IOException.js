export function IOException(message) {
    this.message = message;
    if ("captureStackTrace" in Error)
        Error.captureStackTrace(this, IOException);
    else
        this.stack = (new Error()).stack;
}

IOException.prototype = Object.create(Error.prototype);
IOException.prototype.name = "IOException";
IOException.prototype.constructor = IOException;