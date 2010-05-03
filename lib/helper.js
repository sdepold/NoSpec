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
  }
}