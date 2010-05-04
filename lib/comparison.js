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
    sys.print(comparisonResult ? '.' : 'F')
    
    if(comparisonResult)
      this.emit("success", this)
    else {
      this.error = error
      this.emit("failure", this)
    }
  },
  
  toEqual: function(_obj) {
    var error = "Expected " + sys.inspect(this.obj) + " to equal " + sys.inspect(_obj) + "!"
    var result = this.obj == _obj
    this.sendStatus(result, error)
  },
  
  toMatch: function(_obj) {
    var result = true
    var _this = this

    if(typeof this.obj == "string") {
      result = this.obj.match(_obj)
    } else {
      if(this.obj.keys.length == _obj.keys.length) {
        this.obj.each(function(value, key) {
          if(result) result = (_obj[key] == value)
        })
      } else
        result = false
    }
    
    var error = "Expected " + sys.inspect(this.obj) + " to match " + sys.inspect(_obj) + "!"
    this.sendStatus(result, error)
  },
  
  toBeAnInstanceOf: function(_obj) {
    var error = "Expected " + sys.inspect(this.obj) + " to be an instance of " + _obj + "!"
    var result = (this.obj instanceof _obj)
    this.sendStatus(result, error)
  },
  
  toBeDefined: function() {
    var error = "Expected " + sys.inspect(this.obj) + " to be not null!"
    var result = ((this.obj != null) && (typeof this.obj != "undefined"))
    this.sendStatus(result, error)
  },
  
  toHave: function(count, key) {
    var error, result = false
    
    if(typeof count == "string") {
      error = "Expected " + sys.inspect(this.obj) + " to have " + count + "!"
      result = this.obj[count]
    } else {
      error = "Expected " + sys.inspect(this.obj) + " to have " + count + " " + key + "(s)!"
      if(this.obj[key]) result = this.obj[key].length == count
    }
    
    this.sendStatus(result, error)
  }
}

methods.each(function(method, methodName) {
  exports.NoSpecComparison.prototype[methodName] = method
})