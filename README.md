# Installation #

I recommend to install NoSpec via the node.js package manager kiwi (http://kiwijs.com/):

    kiwi install NoSpec

# Usage #

The folder structure of your library/project is expected as follows:

    |  
    |- lib (for your libs code)  
    |- spec (for your tests)

Use the following lines to setup your specs:

    var kiwi = require("kiwi")
    myLib = require(__dirname + "/../lib/myLib")
    kiwi.require("NoSpec")

    new NoSpec()
      .load(__dirname + "/specFile.js")
      .load(__dirname + "/anotherSpecFile.js")
      .run()

And a spec file looks like that:
    
    // the basic structure
    describe("the class you want to test", function() {
      describe("a function you want to test", function() {
        it("should do something", function() {
          // your nice test code here
        })
      })
    })
    
    // some more practical
    describe("Car", function() {
      describe("constructor", function() {
        it("should throw exception if no speed limit is passed", function() {
          // call the constructor and don't pass a speed limit!
        })
      })
    })
    
# Assertions #

OK, now that you know how to specify tests (the _it_ call) and test suites (the _describe_ call) let's check out the assertion methods:

    describe("comparison methods", function() {
      it("should do smth with toEqual", function () {
        expect("a").toEqual("a") // will be true
        expect("a").toEqual("b") // will be false

        var hash = {a: 1}
        expect(hash).toEqual(hash) // will be true
        expect(hash).toEqual({a: 1}) // will be false
      })

      it("should do smth with toMatch", function() {
        expect("a").toMatch("a") // will be true; equals toEqual("a")
        expect("foobar").toMatch(/.oo.a./) // will be true
        expect("My name is Alice and I'm 10 years old.").toMatch(/.*Alice.*10.*/) // will be true

        var hash = {a: 1}
        expect(hash).toMatch(hash) // will be true; equals toEqual(hash)
        expect(hash).toMatch({a: 1}) // will be true as well
        expect(hash).toMatch({a: 1, b:2}) // will be false; key count have to equal
      })

      it("should do smth with toBeAnInstanceOf", function() {
        var aClass = function(){}
        var anotherClass = function(){}
        var obj = new aClass()

        expect(obj).toBeAnInstanceOf(aClass) // will be true
        expect(obj).toBeAnInstanceOf(anotherClass) // will be false
      })

      it("should do smth with toBeDefined", function() {
        var nulled = null
        var text = "foo"
        var hash = {}

        expect(nulled).toBeDefined() // will be false
        expect(text).toBeDefined() // will be true
        expect(hash.bar).toBeDefined() // will be false
      })
    })