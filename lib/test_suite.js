var kiwi              = require("kiwi"),
    sys               = require("sys"),
    NoSpecTestCase    = require("./test_case").NoSpecTestCase,
    NoSpecComparison  = require("./comparison").NoSpecComparison,
    NoSpecHelper      = require("./helper").NoSpecHelper

kiwi.require("ext", "0.5.0")

exports.NoSpecTestSuite = function(noSpec, description, fn, suite) {
  this.noSpec = noSpec
  this.description = description
  this.filters = {before: [], after: []}
  this.specs = {registered: [], failed: [], succeeded: []}
  this.fn = fn
  this.parent = suite
}
sys.inherits(exports.NoSpecTestSuite, require('events').EventEmitter)

var methods = {
  
  isFinished: function() {
    return this.specs.registered.length == (this.specs.failed.length + this.specs.succeeded.length)
  },
  
  loadSpecs: function() {
    var suite = this
    var wrappers = {
      it: function(description, fn) {
        var spec = new NoSpecTestCase(suite.noSpec, description, fn, suite)
          .addListener("success", function(spec) { suite.registerSuccess(spec) })
          .addListener("failure", function(spec) { suite.registerFailure(spec) })
        suite.specs.registered.push(spec)
        return spec
      },
      describe: function(description, fn) {
        var subSuite = new exports.NoSpecTestSuite(suite.noSpec, description, fn, suite)
          .addListener("success", function(subSuite) { suite.registerSuccess(subSuite)})
          .addListener("failure", function(subSuite) { suite.registerFailure(subSuite)})
        suite.specs.registered.push(subSuite)
        return subSuite
      },
      expect: function() { return NoSpecComparison.getStub() },
      before:     function(fn) { suite.filters.before.push(fn) },
      after:      function(fn) { suite.filters.after.push(fn) }
    }

    with(wrappers) {
      eval(NoSpecHelper.unevalFunction(suite.fn))
    }
  },
  
  getBeforeFilters: function() {
    return this.filters.before.map(function(before) {
      return NoSpecHelper.unevalFunction(before)
    }).join("\n")
  },
  
  run: function() {
    this.loadSpecs()
    
    this.specs.registered.each(function(spec) {
      spec.run()
    })
  },
  
  emitFinished: function() {
    var result = (this.specs.failed.length == 0) ? "success" : "failure"
    this.emit(result, this)
  },
  
  registerSuccess: function(spec) {
    this.specs.succeeded.push(spec)
    if(this.isFinished()) this.emitFinished()
  },

  registerFailure: function(spec)  {
    this.specs.failed.push(spec)
    if(this.isFinished()) this.emitFinished()
  }
}

methods.each(function(method, methodName) {
  exports.NoSpecTestSuite.prototype[methodName] = method
})