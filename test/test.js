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