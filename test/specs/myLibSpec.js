describe("myLib", function() {
  describe("sayHello", function() {
    it("should return hello + name", function() {
      var libInstance = new myLib("Jane")
      expect(libInstance.sayHello()).toEqual("Hello Jane")
      expect(libInstance.sayHello()).toEqual("foo")
    })
  })
  
  describe("sayHello with before Filter", function() {
    before(function() {
      var libInstance = new myLib("John")
    })
    
    it("should return hello john", function(){
      expect(libInstance.sayHello()).toEqual("Hello John")
    })
  })
})