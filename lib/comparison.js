var kiwi = require("kiwi"),
    sys  = require("sys")

kiwi.require("ext", "0.5.0")

exports.NoSpecComparison = function(spec, obj) {
  this.spec = spec
  this.obj = obj
}
sys.inherits(exports.NoSpecComparison, require('events').EventEmitter)

var methods = {
  toEqual: function(_obj) {
    if(this.obj == _obj)
      this.emit("succeeded", this)
    else {
      this.error = "Expected " + sys.inspect(this.obj) + " to equal " + sys.inspect(_obj) + "!"
      this.emit("failed", this)
    }
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

    if(result)
      this.emit("succeeded", this)
    else {
      this.error = "Expected " + sys.inspect(this.obj) + " to match " + sys.inspect(_obj) + "!"
      this.emit("failed", this)
    }
  },
  toBeAnInstanceOf: function(_obj) {
    if(this.obj instanceof _obj)
      this.emit("succeeded", this)
    else {
      this.error = "Expected " + sys.inspect(this.obj) + " to be an instance of " + _obj + "!"
      this.emit("failed", this)
    }
  },
  toBeDefined: function() {
    if((this.obj != null) && (typeof this.obj != "undefined"))
      this.emit("succeeded", this)
    else {
      this.error = "Expected " + sys.inspect(this.obj) + " to be not null!"
      this.emit("failed", this)
    }
  }
}

methods.each(function(method, methodName) {
  exports.NoSpecComparison.prototype[methodName] = method
})