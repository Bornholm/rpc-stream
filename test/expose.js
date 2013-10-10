var RPCStream = require('../lib/rpc-stream');

exports.exposeSingleMethod = function(test) {

  var rpc = new RPCStream();
  var noOp = function() {};
  rpc.expose('noOp', noOp);

  var exposed = rpc.getExposedMethods();

  test.ok(exposed.noOp === noOp, 'Exposed method should be equal to noOp function !');

  test.done();
};

exports.exposeObject = function(test) {

  var rpc = new RPCStream();
  
  var api = {
    bar: function() { return 'bar'; },
    foo: function() { return 'foo' }
  };

  rpc.expose(api);

  var exposed = rpc.getExposedMethods();

  test.ok(exposed.foo === api.foo, 'Exposed method should be equal to foo function !');
  test.ok(exposed.bar === api.bar, 'Exposed method should be equal to bar function !');

  test.done();
};