exports.myLib = function(name){
  this.name = name
}

exports.myLib.prototype.sayHello = function() {
  return "Hello " + this.name
}