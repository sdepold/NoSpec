# Usage #

The folder structure of your library/project is expected as follows:

  |
  |- lib (for your libs code)
  |- spec (for your tests)

Use the following lines to get your specs running:

  var kiwi = require("kiwi")
  myLib = require(__dirname + "/../lib/myLib")
  kiwi.require("NoSpec")

  new NoSpec()
    .load(__dirname + "/specFile.js")
    .load(__dirname + "/anotherSpecFile.js")
    .run()