var kiwi              = require("kiwi"),
    sys               = require("sys"),
    NoSpecComparison  = require("./comparison").NoSpecComparison,
    NoSpecHelper      = require("./helper").NoSpecHelper

kiwi.require("ext", "0.5.0")

exports.NoSpecTestCase = function(noSpec, description, fn, suite) {
  this.noSpec = noSpec
  this.description = description
  this.suite = suite
  this.fn = fn
  this.succeeds = []
  this.fails = []
  this.expectationCount = this.getExpectationCount()
}
sys.inherits(exports.NoSpecTestCase, require('events').EventEmitter)

exports.NoSpecTestCase.expect = function(scope) {
  var result = function(obj){
    var comparison = new NoSpecComparison(scope, obj)
      .addListener("succeeded", function(succeededComparison) {
        scope.succeeds.push(succeededComparison)
        if (scope.isFinished) scope.emit("succeeded")
      })
      .addListener("failed", function(failedComparison) {
        scope.fails.push(failedComparison)
        if (scope.isFinished) scope.emit("failed", scope)
      })
    return comparison
  }
  return result
}

var methods = {
  equals: function(description, fn) {
    return ((this.description == description) && (this.fn.toString() == fn.toString()))
  },
  
  run: function() {
    var testCase = this
    with({expect: exports.NoSpecTestCase.expect(testCase)}) {
      eval(NoSpecHelper.unevalFunction(testCase.fn))
    }
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
  }
}

methods.each(function(method, methodName) {
  exports.NoSpecTestCase.prototype[methodName] = method
})