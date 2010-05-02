var kiwi              = require("kiwi"),
    sys               = require("sys"),
    NoSpecComparison  = require("./comparison").NoSpecComparison

kiwi.require("ext", "0.5.0")

exports.NoSpecTestCase = function(noSpec, description, fn) {
  this.noSpec = noSpec
  this.description = description
  this.fn = fn
  this.succeeds = []
  this.fails = []
  this.expectationCount = this.getExpectationCount()
}
sys.inherits(exports.NoSpecTestCase, require('events').EventEmitter)

var methods = {
  equals: function(description, fn) {
    return ((this.description == description) && (this.fn.toString() == fn.toString()))
  },
  
  run: function() {
    this.fn()
  },

  getExpectationCount: function() {
    var lines = this.fn.toString().split("\n")
    var count = 0
    lines.each(function(line) {
      var comment = line.indexOf("//")
      var expect = line.indexOf("expect")
      if(expect == -1) return;

      // don't increase if comment exist and comment is before expect
      if(!((comment > -1) && (comment < expect))) count++
    })
    return count
  },

  isFinished: function() {
    return this.expectationCount == (this.succeeds.length + this.fails.length)
  },

  expect: function(obj) {
    var _this = this
    var comparison = new NoSpecComparison(this, obj)
      .addListener("succeeded", function(succeededComparison) {
        _this.succeeds.push(succeededComparison)
        if (_this.isFinished) _this.emit("succeeded")
      })
      .addListener("failed", function(failedComparison) { 
        _this.fails.push(failedComparison)
        if (_this.isFinished) _this.emit("failed", _this)
      })
    return comparison
  }
}

methods.each(function(method, methodName) {
  exports.NoSpecTestCase.prototype[methodName] = method
})