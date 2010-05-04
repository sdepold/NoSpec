require(__dirname + "/../lib/nospec")

new NoSpec()
  .load(__dirname + "/test.js")
  .run()