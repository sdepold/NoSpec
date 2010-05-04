var kiwi              = require("kiwi"),
    sys               = require("sys"),
    fs                = require("fs"),
    NoSpecComparison  = require("./comparison").NoSpecComparison,
    NoSpecTestCase    = require("./test_case").NoSpecTestCase,
    NoSpecTestSuite   = require("./test_suite").NoSpecTestSuite

kiwi.require("ext", "0.5.0")

NoSpec = function() {
  this.filters = {before: [], beforeEach: [], after: [], afterEach: []}
  this.specs = {registered: [], failed: [], succeeded: []}
}

NoSpec.specIncluded = function(specs, description, fn) {
  var included = false
  specs.each(function(spec) {
    if(included)
      return
    else if(spec instanceof NoSpecTestCase)
      included = spec.equals(description, fn)
    else if(spec instanceof NoSpecTestSuite)
      included = NoSpec.specIncluded(spec.specs.registered, description, fn)
  })
  return included
}

var methods = {
  specAlreadyRegistered: function(description, fn) {
    return NoSpec.specIncluded(this.specs.registered, description, fn)
  },
  
  getFinishedSpecsCount: function() {
    return this.specs.succeeded.length + this.specs.failed.length
  },

  load: function(file) {
    var noSpec = this
    var wrappers = {
      it: function(description, fn) {
        if(!noSpec.specAlreadyRegistered(description, fn)) {
          var spec = new NoSpecTestCase(noSpec, description, fn)
            .addListener("success", function(spec) { noSpec.registerSuccess(spec) })
            .addListener("failure", function(spec) { noSpec.registerFailure(spec) })
          noSpec.specs.registered.push(spec)
          return spec
        }
      },
      describe: function(description, fn) {
        var suite = new NoSpecTestSuite(noSpec, description, fn)
          .addListener("success", function(suite) { noSpec.registerSuccess(suite)})
          .addListener("failure", function(suite) { noSpec.registerFailure(suite)})
        noSpec.specs.registered.push(suite)
        return suite
      },
      before:     function(fn) { noSpec.filters.before.push(fn) },
      beforeEach: function(fn) { noSpec.filters.beforeEach.push(fn) },
      after:      function(fn) { noSpec.filters.after.push(fn) },
      afterEach:  function(fn) { noSpec.filters.afterEach.push(fn) }
    }
    
    var fileContent = fs.readFileSync(file)
    eval("with(wrappers){\n" + fileContent + "\n}")
    
    return this
  },

  run: function() {
    sys.puts("Starting specs...")

    this.specs.registered.each(function(spec) {
      spec.run()
    })
    
    var _this = this
    var intervalId = setInterval(function() {
      if(_this.specs.registered.length <= _this.getFinishedSpecsCount()) {
        clearInterval(intervalId)
        sys.puts("\nFinished specs!\n")
        _this.printResults()
        process.exit(0)
      }
    }, 1000)
  },

  printResults: function(){
    sys.puts("Total specs: " + this.specs.length + ", Success: " + (this.specs.succeeded.length) + ", Failed: " + this.specs.failed.length)

    if(this.specs.failed.length > 0) {
      sys.puts("Failed specs:")
      this.printFailures(this.specs.failed)
    }
  },
  
  printFailures: function(specs, margin) {
    var noSpec = this
    margin = margin || 2
    specs.each(function(spec) {
      if(spec instanceof NoSpecTestSuite)
        noSpec.printFailures(spec.specs.registered, margin + 2)
      else {
        for(var i = 0; i < margin; i++) sys.print(" ")
        sys.puts(spec.description)
        spec.fails.each(function(fail) {
          for(var i = 0; i < margin; i++) sys.print(" ")
          sys.puts("- " + fail.error)
        })
      }
    })
  },

  registerSuccess: function(spec) {
    this.specs.succeeded.push(spec)
  },

  registerFailure: function(spec) {
    this.specs.failed.push(spec)
  }
}

methods.each(function(method, methodName) {
  NoSpec.prototype[methodName] = method
})