var kiwi              = require("kiwi"),
    sys               = require("sys"),
    NoSpecComparison  = require("./comparison").NoSpecComparison,
    NoSpecHelper      = require("./helper").NoSpecHelper

kiwi.require("ext", "0.5.0")

exports.NoSpecTestCase = function(noSpec, description, fn, suite) {
  this.noSpec = noSpec
  this.description = description
  this.parent = suite
  this.fn = fn
  this.succeeds = []
  this.fails = []
  this.expectationCount = this.getExpectationCount()
}
sys.inherits(exports.NoSpecTestCase, require('events').EventEmitter)

exports.NoSpecTestCase.expect = function(scope) {
  var result = function(obj){
    var comparison = new NoSpecComparison(scope, obj)
      .addListener("success", function(succeededComparison) {
        scope.succeeds.push(succeededComparison)
        if (scope.isFinished()) scope.emitFinished()
      })
      .addListener("failure", function(failedComparison) {
        scope.fails.push(failedComparison)
        if (scope.isFinished()) scope.emitFinished()
      })
    return comparison
  }
  return result
}

var methods = {
  getParents: function() {
    var parents = []
    var current = this
    var result = []
    
    while(current.parent) {
      parents.push(current.parent)
      current = current.parent
    }
    
    for(var i = parents.length-1; i >=0; i--)
      result.push(parents[i])
    
    return result
  },
  
  equals: function(description, fn) {
    return ((this.description == description) && (this.fn.toString() == fn.toString()))
  },
  
  run: function() {
    var testCase = this
    var beforeEachs = testCase.getParents().map(function(parent) {
      return parent.filters.beforeEach
    }).flattened.map(function(beforeEach) {
      return NoSpecHelper.unevalFunction(beforeEach)
    })

    with({expect: exports.NoSpecTestCase.expect(testCase)}) {
      eval(beforeEachs.join("\n"))
      
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
  },
  
  emitFinished: function() {
    var result = (this.fails.length == 0) ? "success" : "failure"
    this.emit(result, this)
  }
}

methods.each(function(method, methodName) {
  exports.NoSpecTestCase.prototype[methodName] = method
})