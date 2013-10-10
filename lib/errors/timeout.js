var util = require('util');

var TimeoutError = function(methodName, timeout) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = "TimeoutError";
  this.message = "The method '" + methodName + "' timed out ! ("+timeout+"ms)";
};

util.inherits(TimeoutError, Error);

module.exports = TimeoutError;