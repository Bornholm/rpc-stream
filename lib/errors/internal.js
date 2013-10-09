var util = require('util');

var InternalError = function(err) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = "InternalError";
  this.message = "An internal error occured !";
  this.error = err;
};

util.inherits(InternalError, Error);

module.exports = InternalError;