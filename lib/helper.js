var kiwi              = require("kiwi"),
    sys               = require("sys"),
    fs                = require("fs")

kiwi.require("ext", "0.5.0")

exports.NoSpecHelper = {
  unevalFunction: function(fn) {
    var stringified = fn.toString()
    var splitted = stringified.split("\n")
    stringified = splitted
      .remove(splitted.last)
      .remove(splitted.first)
      .join("\n")
      
    return stringified
  },
  
  getParents: function(obj) {
    var current = obj
    var parents = []
    var result = []

    while(current.parent) {
      parents.push(current.parent)
      current = current.parent
    }

    for(var i = parents.length-1; i >=0; i--)
      result.push(parents[i])

    return result
  },
  
  mergeDefinitions: function(wrappers, definitions) {
    var result = wrappers
    definitions.each(function(definition) {
      result[definition.name] = definition.element ? require(definition.location)[definition.element] : require(definition.location)
    })
    return result
  },
  
  getFilesInDir: function(dir) {
    var files = []
    fs.readdirSync(dir).each(function(dirEntry) {
      var fullEntry = dir + "/" + dirEntry
      if(exports.NoSpecHelper.isDirectory(fullEntry))
        exports.NoSpecHelper.getFilesInDir(fullEntry).each(function(file) {
          files.push(file)
        })
      else
        files.push(fullEntry)
    })
    return files
  },
  
  isDirectory: function(dir) {
    var result = false
    try { result = fs.statSync(dir).isDirectory() } catch(e) {}
    return result
  },

  isFile: function(file) {
    var result = false
    try { result = fs.statSync(file).isFile() } catch(e) {}
    return result
  },
  
  locationHasUpdates: function(location, time) {
    var hasUpdates = false
    var files = exports.NoSpecHelper.isDirectory(location)
      ? exports.NoSpecHelper.getFilesInDir(location)
      : [location]

    files.each(function(file) {
      if(hasUpdates) return
      hasUpdates = new Date(fs.statSync(file).mtime) > time
    })

    return hasUpdates
  }
}