require(__dirname + "/../lib/nospec")

new NoSpec()
  .define("myLib", __dirname + "/lib/myLib", "myLib")
  .load(__dirname + "/specs")
  .run()