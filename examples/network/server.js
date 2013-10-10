var RPCStream = require('../../lib/rpc-stream');
var JSONSerializer = require('./json-serializer');
var net = require('net');
var JSONStream = require('JSONStream');

var serverApi = {

  add: function(a, b, cb) {
    cb(null, a+b);
  },

  getDate: function(cb) {
    cb(null, Date.now())
  },

};

var tcpServer = net.createServer(function(connection) {

  console.log('New client', connection.remoteAddress);

  var rpcEndpoint = new RPCStream(serverApi);
  rpcEndpoint.on('error', console.error);
  // connection -> deserializer -> rpc
  // rpc -> serializer -> connection
  connection 
    .pipe(JSONStream.parse())
    .pipe(rpcEndpoint)
    .pipe(new JSONSerializer())
    .pipe(connection);

  console.log('Calling "divide" on client', connection.remoteAddress);
  rpcEndpoint.call('divide', 5, 3, function(err, result) {
    console.log('From client', connection.remoteAddress, 'divide() ->', result);
  });

});

tcpServer.listen(8124);

console.log('Server listening');