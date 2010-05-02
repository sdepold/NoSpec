var kiwi              = require("kiwi"),
    sys               = require("sys"),
    NoSpecTestCase    = require("./test_case").NoSpecTestCase

kiwi.require("ext", "0.5.0")

exports.NoSpecTestSuite = function(noSpec, description, fn) {
  this.noSpec = noSpec
  this.description = description
  this.specs = []
  this.failedSpecs = []
  this.succeededSpecs = []
  this.fn = fn
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
        var spec = new NoSpecTestCase(suite.noSpec, description, fn)
          .addListener("succeeded", function(spec) { suite.registerSuccess(spec) })
          .addListener("failed", function(spec) { suite.registerFailure(spec) })
        suite.specs.push(spec)
        return spec
      },
      describe: function(description, fn) {
        var subSuite = new exports.NoSpecTestSuite(suite.noSpec, description, fn)
          .addListener("succeeded", function(subSuite) { suite.registerSuccess(subSuite)})
          .addListener("failed", function(subSuite) { suite.registerFailure(subSuite)})
        suite.specs.push(subSuite)
        return subSuite
      }
    }
    var stringifiedMethod = suite.fn.toString()
    var splittedStringifiedMethod = stringifiedMethod.split("\n")
    stringifiedMethod = splittedStringifiedMethod
      .remove(splittedStringifiedMethod.last)
      .remove(splittedStringifiedMethod.first).join("\n")

    with(wrappers) {
      eval(stringifiedMethod)
    }
    suite.fn.call()
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