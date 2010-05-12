var kiwi              = require("kiwi"),
    sys               = require("sys"),
    fs                = require("fs"),
    NoSpecComparison  = require("./comparison").NoSpecComparison,
    NoSpecTestCase    = require("./test_case").NoSpecTestCase,
    NoSpecTestSuite   = require("./test_suite").NoSpecTestSuite

kiwi.require("ext", "0.5.0")

NoSpec = function() {
  this.filters = {before: [], after: []}
  this.specs = {registered: [], failed: [], succeeded: []}
  this.specLocations = []
  this.autoSpec = process.ARGV.includes("--autoSpec") || process.ARGV.includes("-a")
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

  load: function(specLocation) {
    var _specLocation = specLocation
    if(isDirectory(_specLocation)) {
      this.loadDir(_specLocation)
    } else if(isFile(_specLocation = (specLocation.endsWith(".js") ? specLocation : specLocation + ".js"))) {
      this.loadFile(_specLocation)
    } else {
      _specLocation = null
      sys.puts("No such file to load: " + specLocation)
    }
    
    if(_specLocation) this.specLocations.push({location: _specLocation, time: new Date()})
    
    return this
  },
  
  loadDir: function(dir) {
    var files = []
    var _this = this
    fs.readdirSync(dir).each(function(dirEntry) {
      var fullEntry = dir + "/" + dirEntry
      if(isDirectory(fullEntry))
        _this.loadDir(fullEntry)
      else
        files.push(fullEntry)
    })
    files.each(function(file) {
      _this.loadFile(file)
    })
  },
  
  loadFile: function(fileName) {
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
      after:      function(fn) { noSpec.filters.after.push(fn) }
    }
    var fileContent = fs.readFileSync(fileName)
    eval("with(wrappers){\n" + fileContent + "\n}")
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
        
        if(_this.autoSpec) _this.runAtIdle()
        else process.exit(0)
      }
    }, 1000)
  },
  
  runAtIdle: function() {
    var _this = this

    // reset all spec arrays
    this.specs.each(function(_, key) { _this.specs[key] = [] })
    var intervalId = setInterval(function() {
      var hasUpdates = false
      _this.specLocations.each(function(specLocation) {
        if(hasUpdates) return
        hasUpdates = locationHasUpdates(specLocation.location, specLocation.time)
      })
      
      if(hasUpdates) {
        clearInterval(intervalId)
        
        sys.puts("\n------------------------------------------------------------------")
        sys.puts("Found changes in the specs! Restarting...")
        sys.puts("------------------------------------------------------------------\n")
        
        var _specLocations = _this.specLocations.slice() // will clone the array
        _this.specLocations = [] // clear it before calling load, because this will add new specLocations
        _specLocations.each(function(specLocation) {
          _this.load(specLocation.location)
        })
        _this.run()
      }
    }, 1000)
  },
  
  getAssertionCount: function(type, scope) {
    var result  = 0,
        _this   = this,
        specs   = (scope || this).specs.registered
        
    specs.each(function(spec) {
      if(spec instanceof NoSpecTestSuite)
        result += _this.getAssertionCount(type, spec)
      else {
        switch(type) {
          case "registered":  result += spec.expectationCount; break;
          case "succeeded":   result += spec.succeeds.length; break;
          case "failed":      result += spec.fails.length; break;
        }
      }
    })
    
    return result
  },

  printResults: function(){
    sys.puts("Specs:      [Total: " + this.specs.registered.length + ", Success: " + (this.specs.succeeded.length) + ", Failed: " + this.specs.failed.length + "]")
    sys.puts("Assertions: [Total: " + this.getAssertionCount("registered") + ", Success: " + this.getAssertionCount("succeeded") + ", Failed: " + this.getAssertionCount("failed") + "]")

    if(this.specs.failed.length > 0) {
      sys.puts("Failed specs:")
      this.printFailures(this.specs.failed)
    }
  },
  
  printFailures: function(specs, margin) {
    var noSpec = this
    margin = margin || 0
    specs.each(function(spec) {
      spec.reportErrors(margin + 1)
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

var isDirectory = function(dir) {
  var result = false
  try { result = fs.statSync(dir).isDirectory() } catch(e) {}
  return result
}

var isFile = function(file) {
  var result = false
  try { result = fs.statSync(file).isFile() } catch(e) {}
  return result
}

var locationHasUpdates = function(location, time) {
  var hasUpdates = false
  
  if(isDirectory(location))
    fs.readdirSync(location).each(function(dirEntry) {
      if(hasUpdates) return
      hasUpdates = locationHasUpdates(location + "/" + dirEntry, time)
    })
  else
    hasUpdates = new Date(fs.statSync(location).mtime) > time
  
  return hasUpdates
}