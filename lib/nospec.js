var kiwi              = require("kiwi"),
    sys               = require("sys"),
    fs                = require("fs"),
    NoSpecComparison  = require("./comparison").NoSpecComparison,
    NoSpecTestCase    = require("./test_case").NoSpecTestCase,
    NoSpecTestSuite   = require("./test_suite").NoSpecTestSuite

kiwi.require("ext", "0.5.0")

NoSpec = function() {
  this.specs = []
  this.succeededSpecs = []
  this.failedSpecs = []
}

NoSpec.specIncluded = function(specs, description, fn) {
  var included = false
  specs.each(function(spec) {
    if(included)
      return
    else if(spec instanceof NoSpecTestCase)
      included = spec.equals(description, fn)
    else if(spec instanceof NoSpecTestSuite)
      included = NoSpec.specIncluded(spec.specs, description, fn)
  })
  return included
}

var methods = {
  specAlreadyRegistered: function(description, fn) {
    return NoSpec.specIncluded(this.specs, description, fn)
  },
  
  getFinishedSpecsCount: function() {
    return this.succeededSpecs.length + this.failedSpecs.length
  },

  load: function(file) {
    var noSpec = this
    var wrappers = {
      it: function(description, fn) {
        if(!noSpec.specAlreadyRegistered(description, fn)) {
          var spec = new NoSpecTestCase(noSpec, description, fn)
            .addListener("succeeded", function(spec) { noSpec.registerSuccess(spec) })
            .addListener("failed", function(spec) { noSpec.registerFailure(spec) })
          noSpec.specs.push(spec)
          return spec
        }
      },
      describe: function(description, fn) {
        var suite = new NoSpecTestSuite(noSpec, description, fn)
          .addListener("succeeded", function(suite) { noSpec.registerSuccess(suite)})
          .addListener("failed", function(suite) { noSpec.registerFailure(suite)})
        noSpec.specs.push(suite)
        return suite
      }
    }
    
    var fileContent = fs.readFileSync(file)
    eval("with(wrappers){\n" + fileContent + "\n}")
    
    return this
  },

  run: function() {
    sys.puts("Starting specs...")

    this.specs.each(function(spec) {
      spec.run()
    })
    
    var _this = this
    var intervalId = setInterval(function() {
      if(_this.specs.length <= _this.getFinishedSpecsCount()) {
        clearInterval(intervalId)
        sys.puts("\nFinished specs!\n")
        _this.printResults()
      }
    }, 1000)
  },

  printResults: function(){
    sys.puts("Total specs: " + this.specs.length + ", Success: " + (this.succeededSpecs.length) + ", Failed: " + this.failedSpecs.length)

    if(this.failedSpecs.length > 0) {
      sys.puts("Failed specs:")
      this.printFailures(this.failedSpecs)
    }
  },
  
  printFailures: function(specs, margin) {
    var noSpec = this
    margin = margin || 2
    specs.each(function(spec) {
      if(spec instanceof NoSpecTestSuite)
        noSpec.printFailures(spec.specs, margin + 2)
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
    sys.print(".")
    this.succeededSpecs.push(spec)
  },

  registerFailure: function(spec) {
    sys.print("F")
    this.failedSpecs.push(spec)
  }
}

methods.each(function(method, methodName) {
  NoSpec.prototype[methodName] = method
})