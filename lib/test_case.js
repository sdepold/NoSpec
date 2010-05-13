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
  equals: function(description, fn) {
    return ((this.description == description) && (this.fn.toString() == fn.toString()))
  },
  
  getFilters: function(filterType) {
    return NoSpecHelper.getParents(this).map(function(parent) {
      return parent.filters[filterType]
    }).flattened.map(function(filter) {
      return NoSpecHelper.unevalFunction(filter)
    }).join("\n")
  },
  
  run: function() {
    var testCase = this
    var wrappers = NoSpecHelper.mergeDefinitions({
      expect: exports.NoSpecTestCase.expect(testCase)
    }, testCase.noSpec.definitions)
    
    with(wrappers) {
      eval(testCase.getFilters("before"))
      eval(NoSpecHelper.unevalFunction(testCase.fn))
      eval(testCase.getFilters("after"))
    }
  },

  getExpectationCount: function() {
    var lines = [NoSpecHelper.unevalFunction(this.fn), this.getFilters("before"), this.getFilters("after")].join("\n").split("\n")
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
  },
  
  reportErrors: function(margin) {
    if(this.fails.isEmpty) return

    this.fails.each(function(fail) {
      for(var j = 0; j < margin; j++) sys.print("  ")
      sys.puts("- " + fail.error)
    })
  }
}

methods.each(function(method, methodName) {
  exports.NoSpecTestCase.prototype[methodName] = method
})