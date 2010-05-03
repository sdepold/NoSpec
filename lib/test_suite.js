var kiwi              = require("kiwi"),
    sys               = require("sys"),
    NoSpecTestCase    = require("./test_case").NoSpecTestCase,
    NoSpecComparison  = require("./comparison").NoSpecComparison,
    NoSpecHelper      = require("./helper").NoSpecHelper

kiwi.require("ext", "0.5.0")

exports.NoSpecTestSuite = function(noSpec, description, fn, suite) {
  this.noSpec = noSpec
  this.description = description
  this.specs = []
  this.failedSpecs = []
  this.succeededSpecs = []
  this.fn = fn
  this.parentSuite = suite
}
sys.inherits(exports.NoSpecTestSuite, require('events').EventEmitter)

var methods = {
  isFinished: function() {
    return this.specs == this.failedSpecs.length + this.succeededSpecs
  },
  
  loadSpecs: function() {
    var suite = this
    var wrappers = {
      it: function(description, fn) {
        var spec = new NoSpecTestCase(suite.noSpec, description, fn, suite)
          .addListener("succeeded", function(spec) { suite.registerSuccess(spec) })
          .addListener("failed", function(spec) { suite.registerFailure(spec) })
        suite.specs.push(spec)
        return spec
      },
      describe: function(description, fn) {
        var subSuite = new exports.NoSpecTestSuite(suite.noSpec, description, fn, suite)
          .addListener("succeeded", function(subSuite) { suite.registerSuccess(subSuite)})
          .addListener("failed", function(subSuite) { suite.registerFailure(subSuite)})
        suite.specs.push(subSuite)
        return subSuite
      },
      expect: function() {
        return NoSpecComparison.getStub()
      }
    }

    with(wrappers) {
      eval(NoSpecHelper.unevalFunction(suite.fn))
    }
  },
  
  run: function() {
    this.loadSpecs()

    this.specs.each(function(spec) {
      spec.run()
    })
  },
  
  registerSuccess: function(spec) {
    this.succeededSpecs.push(spec)
    if (this.isFinished) this.emit("succeeded", this)
  },

  registerFailure: function(spec) {
    this.failedSpecs.push(spec)
    if (this.isFinished) this.emit("failed", this)
  }
}

methods.each(function(method, methodName) {
  exports.NoSpecTestSuite.prototype[methodName] = method
})