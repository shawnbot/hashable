var curio = require("../curio"),
    assert = require("assert");

describe("curio.format()", function() {

  describe("#match()", function() {
    it("should match an empty string", function() {
      var empty = curio.format("");
      assert.notEqual(empty.match(""), null);
    });

    it("should match a single word component", function() {
      var single = curio.format("{foo}"),
          match = single.match("bar");
      assert.notEqual(match, null);
      assert.equal(match.length, 2);
      assert.equal(match[0], "bar");
    });

    it("should match two word components", function() {
      var double = curio.format("{foo}/{bar}"),
          match = double.match("baz/qux");
      assert.notEqual(match, null);
      assert.equal(match.length, 3);
      assert.deepEqual([].slice.call(match, 1, 3), ["baz", "qux"]);
    });
  });

  describe("#parse()", function() {
    it("should parse an empty string", function() {
      var empty = curio.format("");
      assert.deepEqual(empty.parse(""), {});
    });

    it("should parse a single word component", function() {
      var single = curio.format("{foo}");
      assert.deepEqual(single.parse("bar"), {foo: "bar"});
    });

    it("should parse two word components", function() {
      var double = curio.format("{foo}/{bar}");
      assert.deepEqual(double.parse("apple/orange"), {
        foo: "apple",
        bar: "orange"
      });
    });

    it("should parse two word components surrounded by other words", function() {
      var complex = curio.format("kingdom/{kingdom}/phylum/{phylum}");
      assert.deepEqual(complex.parse("kingdom/Plant/phylum/Ginkgophyta"), {
        kingdom: "Plant",
        phylum: "Ginkgophyta"
      });
    });
  });

  describe("#query()", function() {
    it("should not parse query strings by default", function() {
      var fmt = curio.format("/some/{foo}");
      assert.equal(fmt.parse("/some/blah?bar=2"), null);
    });

    it("should parse query strings", function() {
      var fmt = curio.format("/some/{foo}").query(true);
      assert.deepEqual(fmt.parse("/some/blah?bar=2"), {
        foo: "blah",
        bar: 2
      });
    });

    it("should not override format components with query variables", function() {
      var fmt = curio.format("/some/{foo}").query(true);
      assert.deepEqual(fmt.parse("/some/blah?foo=2"), {
        foo: "blah"
      });
    });

  });

});

describe("curio.format.map()", function() {

  it("should parse map coordinates", function() {
    var fmt = curio.format.map();
    assert.deepEqual(fmt.parse("5/10/12.4"), {
      z: 5,
      x: 10,
      y: 12.4
    });
    assert.deepEqual(fmt.parse("5/-102.4/-13.800001"), {
      z: 5,
      x: -102.4,
      y: -13.800001
    });
    assert.deepEqual(fmt.parse("5/102.4/13.8?style=toner"), {
      z: 5,
      x: 102.4,
      y: 13.8,
      style: "toner"
    });
  });

});

describe("curio.diff()", function() {
  it("properly compares empty objects", function() {
    assert.deepEqual(curio.diff(null, null), null);
    assert.deepEqual(curio.diff(null, {}), null);
    assert.deepEqual(curio.diff({}, null), null);
    assert.deepEqual(curio.diff({}, {}), null);
  });

  it("properly detects a removed key", function() {
    assert.deepEqual(curio.diff({foo: "bar"}, {}), {
      foo: {op: "remove", value: "bar"}
    });
    assert.deepEqual(curio.diff({foo: "bar", baz: 1}, {baz: 1}), {
      foo: {op: "remove", value: "bar"}
    });
  });

  it("properly detects an added key", function() {
    assert.deepEqual(curio.diff({}, {foo: "bar"}), {
      foo: {op: "add", value: "bar"}
    });
    assert.deepEqual(curio.diff({baz: 1}, {foo: "bar", baz: 1}), {
      foo: {op: "add", value: "bar"}
    });
  });

  it("properly detects a changed key", function() {
    assert.deepEqual(curio.diff({foo: "bar"}, {foo: "baz"}), {
      foo: {op: "change", value: ["bar", "baz"]}
    });
    assert.deepEqual(curio.diff({foo: "a", baz: 1}, {foo: "b", baz: 2}), {
      foo: {op: "change", value: ["a", "b"]},
      baz: {op: "change", value: [1, 2]}
    });
  });

});


describe("curio.hash()", function() {

  // jsdom rules.
  var jsdom = require("jsdom");

  jsdom.env("./hash.html", ["../curio.js"], function(errors, window) {

    it("should fire change events", function(done) {
      var hash = window.curio.hash()
        .change(function(e) {
          assert.deepEqual(e.data, {path: "foo"});
          done();
        });
      window.location.hash = "foo";
    });

    it("should change the hash", function() {
      var hash = window.curio.hash()
        .data({path: "foo", bar: 1})
        .write();
      assert.equal(window.location.hash, "foo?bar=1");
    });

    it("should read the hash", function() {
      location.hash = "?bar=2";
      var hash = window.curio.hash()
        .read();
      assert.deepEqual(hash.data(), {path: "", bar: 2});
    });

    it("should disable and re-enable itself", function(done) {
      var hash = window.curio.hash()
        .change(function(e) {
          throw "This should be disabled.";
        })
        .disable();
      location.hash = "path/to/foo?bar=baz";
      hash
        .change(done)
        .enable();
      location.hash = "path/to/foo?bar=qux";
    });

  });

});
