var RPCStream = require('../lib/rpc-stream');
var InternalError = require('../lib/errors/internal');
var TimeoutError = require('../lib/errors/timeout');
var MethodNotFoundError = require('../lib/errors/method-not-found');
var async = require('async');

exports.callRemoteMethod = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  var add = function(a, b, done) { 
    return done(null, a+b);
  };

  server.expose('add', add);

  // client <-> server
  client.pipe(server).pipe(client);

  client.call('add', 5, 3, function(err, result) {
    test.ifError(err);
    test.ok(result === 8, 'Result should be equal to 8 !');
    test.done();
  });

};

exports.callMethodWithArgs = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  var add = function(a, b, done) { 
    return done(null, a+b);
  };

  server.expose('add', add);

  // client <-> server
  client.pipe(server).pipe(client);

  client.call('add', 5, 3, function(err, result) {
    test.ifError(err);
    test.ok(result === 8, 'Result should be equal to 8 !');
    test.done();
  });

};

exports.callMethodWithoutArgs = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  var getOne = function(done) { 
    return done(null, 1);
  };

  server.expose('getOne', getOne);

  // client <-> server
  client.pipe(server).pipe(client);

  client.call('getOne', function(err, result) {
    test.ifError(err);
    test.ok(result === 1, 'Result should be equal to 1 !');
    test.done();
  });

};

exports.callMethodAsNotification = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  var notified = false;
  var notify = function(token, done) {
    test.ok(token === 21, 'Result should be equal to 21 !');
    test.done();
    return done(null);
  };

  server.expose('notify', notify);

  // client <-> server
  client.pipe(server).pipe(client);

  client.call('notify', 21);

};

exports.callMethodWithErrorReturn = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  var badMethod = function(done) {
    return done(new Error('Caught error !'));
  };

  server.expose('badMethod', badMethod);

  var emittedError;
  server.on('error', function(err) {
    emittedError = err;
  });

  // client <-> server
  client.pipe(server).pipe(client);

  client.call('badMethod', function(err) {
    test.ok(emittedError instanceof InternalError, 'Server should emit an InternalError !');
    test.ok(err, 'Call should return an InternalError !');
    test.done();
  });

};

exports.callMethodWithUnexpectedError = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  var badMethod = function(done) {
    throw new Error('Unexpected error !');
    return done();
  };

  server.expose('badMethod', badMethod);

  var emittedError;
  server.on('error', function(err) {
    emittedError = err;
  });

  // client <-> server
  client.pipe(server).pipe(client);

  client.call('badMethod', function(err) {
    test.ok(emittedError instanceof InternalError, 'Server should emit an InternalError !');
    test.ok(err, 'Call should return an InternalError !');
    test.done();
  });

};

exports.callMethodTimeout = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  client.timeout = 250;

  var timingOut = function(done) {
    setTimeout(done, 500);
  };

  server.expose('timingOut', timingOut);

  // client <-> server
  client.pipe(server).pipe(client);

  client.call('timingOut', function(err) {
    test.ok(err instanceof TimeoutError, 'Call should return a TimeoutError !');
    test.done();
  });

};

exports.callUnexistingMethod = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  var emittedError;
  server.on('error', function(err) {
    emittedError = err;
  });

  // client <-> server
  client.pipe(server).pipe(client);

  client.call('unknownMethod', function(err) {
    test.ok(emittedError instanceof MethodNotFoundError, 'Server should emit a MethodNotFoundError !');
    test.ok(err instanceof MethodNotFoundError, 'Client call should return a MethodNotFoundError !');
    test.done();
  });

};


exports.repeatedCalls = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  server.expose('add', function(a, b, done) { return done(null, a+b); });

  // client <-> server
  client.pipe(server).pipe(client);

  async.times(100, function(i, next) {
    client.call('add', 5, -3, function(err, result) {
      test.ok(result === 2, "Result should be equal to 2 !");
      return next(err);
    });
  }, function(err) {
    test.ifError(err);
    test.done();
  });

};