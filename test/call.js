var RPCStream = require('../lib/rpc-stream');
var InternalError = require('../lib/errors/internal');

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

exports.callMethodWithError = function(test) {

  var client = new RPCStream();
  var server = new RPCStream();

  var badMethod = function(done) {
    return done(new Error('Unwanted error'));
  };

  server.expose('badMethod', badMethod);

  var internalErr;
  server.on('error', function(err) {
    internalErr = err;
  });

  // client <-> server
  client.pipe(server).pipe(client);

  client.call('badMethod', function(err) {
    test.ok(internalErr instanceof InternalError, 'An internal error should be emitted !');
    test.ok(err, 'Call should return an error !');
    test.done();
  });

};