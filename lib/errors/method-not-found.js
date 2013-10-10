var util = require('util');

var MethodNotFoundError = function(methodName) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = "MethodNotFoundError";
  this.message = "The required method '" + methodName + "' is not defined !";
};

util.inherits(MethodNotFoundError, Error);

module.exports = MethodNotFoundError;