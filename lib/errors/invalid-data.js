var util = require('util');

var InvalidDataError = function(data) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = "InvalidDataError";
  this.message = "The provided data is not a valid RPC command !";
  this.data = data;
};

util.inherits(InvalidDataError, Error);

module.exports = InvalidDataError;