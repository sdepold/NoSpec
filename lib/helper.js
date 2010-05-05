var kiwi              = require("kiwi"),
    sys               = require("sys")

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
  }
}