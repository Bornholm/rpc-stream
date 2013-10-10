module.exports = {
  RPCStream: require('./lib/rpc-stream'),
  InternalError: require('./lib/errors/internal'),
  InvalidDataError: require('./lib/errors/invalid-data'),
  MethodNotFoundError: require('./lib/errors/method-not-found'),
};