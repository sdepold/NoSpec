var kiwi = require("kiwi"),
    sys  = require("sys")

kiwi.require("ext", "0.5.0")

exports.NoSpecComparison = function(spec, obj) {
  this.spec = spec
  this.obj = obj
}
sys.inherits(exports.NoSpecComparison, require('events').EventEmitter)

exports.NoSpecComparison.expect = function(obj) {
  return new exports.NoSpecComparison(null, obj)
}

exports.NoSpecComparison.getStub = function() {
  var stub = function(){}
  methods.each(function(method, methodName) {
    stub.prototype[methodName] = function(){}
  })
  return new stub()
}

var methods = {
  sendStatus: function(comparisonResult, error) {
    if(comparisonResult)
      this.emit("succeeded", this)
    else {
      this.error = error
      this.emit("failed", this)
    }
  },
  
  toEqual: function(_obj) {
    var error = "Expected " + sys.inspect(this.obj) + " to equal " + sys.inspect(_obj) + "!"
    this.sendStatus(this.obj == _obj, error)
  },
  
  toMatch: function(_obj) {
    var result = true
    var _this = this

    if(typeof this.obj == "string") {
      result = this.obj.match(_obj)
    } else {
      this.obj.each(function(value, key) {
        if(result) result = (_obj[key] == value)
      })
    }
    
    var error = "Expected " + sys.inspect(this.obj) + " to match " + sys.inspect(_obj) + "!"
    this.sendStatus(result, error)
  },
  
  toBeAnInstanceOf: function(_obj) {
    var error = "Expected " + sys.inspect(this.obj) + " to be an instance of " + _obj + "!"
    this.sendStatus(this.obj instanceof _obj, error)
  },
  toBeDefined: function() {
    var error = "Expected " + sys.inspect(this.obj) + " to be not null!"
    this.sendStatus((this.obj != null) && (typeof this.obj != "undefined"), error)
  }
}

methods.each(function(method, methodName) {
  exports.NoSpecComparison.prototype[methodName] = method
})