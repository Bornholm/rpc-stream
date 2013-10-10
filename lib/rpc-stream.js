var Duplex = require('stream').Duplex;
var util = require('util');
// Custom Errors
var InternalError = require('./errors/internal');
var MethodNotFoundError = require('./errors/method-not-found');
var InvalidDataError = require('./errors/invalid-data');

function RPCStream(exposed) {
  Duplex.call(this, {objectMode: true});
  this._exposed = {};
  this._responses = {};
  this._counter = 0;
  this._stack = [];
  this._stackMode = false;
  this.expose(exposed);
}

RPCStream.REQUEST = 'request';
RPCStream.RESPONSE = 'response';

util.inherits(RPCStream, Duplex);

var p = RPCStream.prototype;

var slice = Array.prototype.slice;

p.call = function() {
  var args = slice.call(arguments);
  if(args.length >= 1) {
    var method = args[0];
    var params = args.slice(1);
    var cb = typeof params[params.length-1] === 'function' ? params.pop() : null;
    var isNotif = !cb;
    var request = {
      type: RPCStream.REQUEST,
      method: method,
      params: params,
      id: isNotif ? undefined : ++this._counter
    };
    if(!isNotif) {
      this._responses[this._counter] = cb;
    }
    this._send(request);
  } else {
    throw new Error('Invalid number of arguments !');
  }
  
  return this;
};

p.expose = function(method, fn) {
  if(arguments.length === 1) { // rpc.expose({'add': function() {...}, ...});
    this._exposed = method || {};
  } else {
    this._exposed[method] = fn;
  }
  return this;
};

p.getExposedMethods = function() {
  return this._exposed;
};

p._send = function(data) {
  if(this._stackMode) {
    this._stack.push(data);
  } else {
    this._stackMode = !this.push(data);
  }
  return this;
}

p._write = function(data, encoding, cb) {
  switch(data.type) {
    case RPCStream.REQUEST:
      this._handleRequest(data, cb);
    break;
    case RPCStream.RESPONSE:
      this._handleResponse(data, cb);
    break;
    default:
      return cb(new InvalidDataError(data));
    break;
  }
};

p._read = function() {
  var stack = this._stack;
  if(stack.length) {
    this._send(stack.shift());
  }
};

p._handleResponse = function(response, cb) {
  var responses = this._responses;
  var id = response.id;
  var handler = id ? responses[id] : null;
  if(handler) {
    handler(response.error, response.result);
    delete responses[id];
  }
  return setImmediate(cb);
};

function methodResultHandler(request, err, result) {
  var internalError;
  if(err) {
    internalError = new InternalError(err);
    this.emit('error', internalError);
  }
  if(request.id) {
    var response = {
      type: RPCStream.RESPONSE,
      id: request.id
    };
    if(internalError) {
      response.error = internalError;
    } else {
      response.result = result;
    }
    return this._send(response);
  }
}

p._handleRequest = function(request, cb) {

  var error;
  var exposed = this._exposed;
  var method = exposed[request.method];

  if(typeof method === 'function') {
    try {
      var params = request.params;
      params = Array.isArray(params) ? params.slice() : [params];
      var handler = methodResultHandler.bind(this, request);
      params.push(handler);
      method.apply(null, params);
    } catch(err) {
      error = new InternalError(err);
      this.emit('error', error);
    }
  } else {
    error = new MethodNotFoundError(request.method);
    this.emit('error', error);
  }

  if(error) {
    var response = {
      type: RPCStream.RESPONSE,
      id: request.id,
      error: error
    };
    this._send(response);
  }

  return setImmediate(cb);
};

module.exports = RPCStream;
