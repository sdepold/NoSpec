describe("smth", function() {
  it("should do smth with toEqual", function () {
    expect("a").toEqual("a") // will be true
    expect("a").toEqual("b") // will be false
    
    var hash = {a: 1}
    expect(hash).toEqual(hash) // will be true
    expect(hash).toEqual({a: 1}) // will be false
  })
})