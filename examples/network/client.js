var RPCStream = require('../../lib/rpc-stream');
var JSONSerializer = require('./json-serializer');
var net = require('net');
var JSONStream = require('JSONStream');

var clientApi = {
  divide: function(a, b, cb) {
    return cb(null, a/b);
  }
};

var rpcEndpoint = new RPCStream(clientApi);
var tcpClient = net.connect({port: 8124});

rpcEndpoint.on('error', console.error);

tcpClient
  .pipe(JSONStream.parse())
  .pipe(rpcEndpoint)
  .pipe(new JSONSerializer())
  .pipe(tcpClient);

console.log('Calling "add" on server', tcpClient.remoteAddress);
rpcEndpoint.call('add', [5, 6], function(err, result) {
  console.log('From server', tcpClient.remoteAddress, 'add() ->', result);
});

setInterval(function() {
  console.log('Calling "getDate" on server', tcpClient.remoteAddress);
  rpcEndpoint.call('getDate', [], function(err, result) {
    console.log('From server', tcpClient.remoteAddress, 'getDate() ->', result);
  });
}, 3000)