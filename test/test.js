var hashable = require("../hashable"),
    assert = require("assert"),
    jsdom = require("jsdom");

describe("hashable.qs", function() {
  var qs = hashable.qs;

  describe("qs.parse()", function() {
    it("should parse = in parameter values", function() {
      assert.deepEqual(qs.parse("foo=bar&baz=foo=1"), {
        foo: "bar",
        baz: "foo=1"
      });
    });

    it("should parse no parameter value as true", function() {
      assert.deepEqual(qs.parse("foo=bar&baz"), {
        foo: "bar",
        baz: true
      });
      assert.deepEqual(qs.parse("foo&baz=bar"), {
        foo: true,
        baz: "bar"
      });
      assert.deepEqual(qs.parse("foo=&bar"), {
        foo: "",
        bar: true
      });
    });
  });

});

describe("hashable.format()", function() {

  it("should default to query() === false", function() {
    assert.equal(hashable.format("{foo}").query(), false);
  });

  it("should support the ? suffix", function() {
    assert.equal(hashable.format("{foo}?").query(), true);
    assert.equal(hashable.format("foo?")({beep: "boop"}), "foo?beep=boop");
    assert.equal(hashable.format("foo/{beep}?")({beep: "boop"}), "foo/boop");
    assert.equal(hashable.format("foo/{beep}?")({beep: "boop", blop: 1}), "foo/boop?blop=1");
  });

  describe("#match()", function() {
    it("should match an empty string", function() {
      var empty = hashable.format("");
      assert.notEqual(empty.match(""), null);
    });

    it("should match a single word component", function() {
      var single = hashable.format("{foo}"),
          match = single.match("bar");
      assert.notEqual(match, null);
      assert.equal(match.length, 2);
      assert.equal(match[0], "bar");
    });

    it("should match two word components", function() {
      var double = hashable.format("{foo}/{bar}"),
          match = double.match("baz/qux");
      assert.notEqual(match, null);
      assert.equal(match.length, 3);
      assert.deepEqual([].slice.call(match, 1, 3), ["baz", "qux"]);
    });
  });

  describe("#parse()", function() {
    it("should parse an empty string", function() {
      var empty = hashable.format("");
      assert.deepEqual(empty.parse(""), {});
    });

    it("should parse a single word component", function() {
      var single = hashable.format("{foo}");
      assert.deepEqual(single.parse("bar"), {foo: "bar"});
    });

    it("should parse two word components", function() {
      var double = hashable.format("{foo}/{bar}");
      assert.deepEqual(double.parse("apple/orange"), {
        foo: "apple",
        bar: "orange"
      });
    });

    it("should parse two word components surrounded by other words", function() {
      var complex = hashable.format("kingdom/{kingdom}/phylum/{phylum}");
      assert.deepEqual(complex.parse("kingdom/Plant/phylum/Ginkgophyta"), {
        kingdom: "Plant",
        phylum: "Ginkgophyta"
      });
    });
  });

  describe("#query()", function() {
    it("should not parse query strings by default", function() {
      var fmt = hashable.format("/some/{foo}");
      assert.equal(fmt.parse("/some/blah?bar=2"), null);
    });

    it("should parse query strings", function() {
      var fmt = hashable.format("/some/{foo}").query(true);
      assert.deepEqual(fmt.parse("/some/blah?bar=2"), {
        foo: "blah",
        bar: 2
      });
    });

    it("should not override format components with query variables", function() {
      var fmt = hashable.format("/some/{foo}").query(true);
      assert.deepEqual(fmt.parse("/some/blah?foo=2"), {
        foo: "blah"
      });
    });

  });

});

describe("hashable.format.map()", function() {

  it("should parse map coordinates", function() {
    var fmt = hashable.format.map();
    assert.deepEqual(fmt.parse("5/10/12.4"), {
      z: 5,
      y: 10,
      x: 12.4
    });
    assert.deepEqual(fmt.parse("5/-102.4/-13.800001"), {
      z: 5,
      y: -102.4,
      x: -13.800001
    });
    assert.deepEqual(fmt.parse("5/102.4/13.8?style=toner"), {
      z: 5,
      y: 102.4,
      x: 13.8,
      style: "toner"
    });
  });

  it("should accept other alternative formats", function() {
    var fmt = hashable.format.map("{layer}/{z}/{y}/{x}");
    assert.deepEqual(fmt.parse("watercolor/10/35.4/-122.2"), {
      layer: "watercolor",
      z: 10,
      y: 35.4,
      x: -122.2
    });

    // note that zoom 10 = 4-digit precision
    assert.deepEqual(fmt.parse("watercolor/10/35.4/-122.2?overlay=blah"), {
      layer: "watercolor",
      z: 10,
      y: 35.4,
      x: -122.2,
      overlay: "blah"
    });

    // note that zoom 10 = 4-digit precision
    assert.deepEqual(fmt.parse("watercolor/10/35.4/-122.2?overlay=blah"), {
      layer: "watercolor",
      z: 10,
      y: 35.4,
      x: -122.2,
      overlay: "blah"
    });

    assert.equal(fmt({
      layer: "watercolor",
      z: 10,
      y: 35.4,
      x: -122.2,
      overlay: "blah"
    }), "watercolor/10/35.4000/-122.2000?overlay=blah");
  });

  it("should respect precision settings", function() {
    var fmt = hashable.format.map().precision(1);
    assert.deepEqual(fmt({
      z: 10,
      y: 35.4301,
      x: -122.256
    }), "10/35.4/-122.3");

    fmt.precision(4);
    assert.deepEqual(fmt({
      z: 10,
      y: 35.4301,
      x: -122.256
    }), "10/35.4301/-122.2560");
  });
});

describe("hashable.diff()", function() {
  it("properly compares empty objects", function() {
    assert.deepEqual(hashable.diff(null, null), null);
    assert.deepEqual(hashable.diff(null, {}), null);
    assert.deepEqual(hashable.diff({}, null), null);
    assert.deepEqual(hashable.diff({}, {}), null);
  });

  it("properly detects a removed key", function() {
    assert.deepEqual(hashable.diff({foo: "bar"}, {}), {
      foo: {op: "remove", value: "bar"}
    });
    assert.deepEqual(hashable.diff({foo: "bar", baz: 1}, {baz: 1}), {
      foo: {op: "remove", value: "bar"}
    });
  });

  it("properly detects an added key", function() {
    assert.deepEqual(hashable.diff({}, {foo: "bar"}), {
      foo: {op: "add", value: "bar"}
    });
    assert.deepEqual(hashable.diff({baz: 1}, {foo: "bar", baz: 1}), {
      foo: {op: "add", value: "bar"}
    });
  });

  it("properly detects a changed key", function() {
    assert.deepEqual(hashable.diff({foo: "bar"}, {foo: "baz"}), {
      foo: {op: "change", value: ["bar", "baz"]}
    });
    assert.deepEqual(hashable.diff({foo: "a", baz: 1}, {foo: "b", baz: 2}), {
      foo: {op: "change", value: ["a", "b"]},
      baz: {op: "change", value: [1, 2]}
    });
  });

});


describe("hashable.hash()", function() {

  // jsdom rules.
  var tests = [],
      window;

  jsdom.env("./hash.html", ["../hashable.js"], function(errors, win) {
    if (errors) {
      throw "jsdom said: " + errors;
    }
    window = win;
    tests.forEach(function(test) {
      test[0].call(window, test[1]);
    });
  });

  function wit(title, fn) {
    it(title, function(done) {
      if (window) fn(done);
      else tests.push([fn, done]);
    });
  }

  wit("should fire change events", function(done) {
    var hash = window.hashable.hash()
      .change(function(e) {
        assert.deepEqual(e.data, {path: "foo"});
        done();
      })
      .enable();
    window.location.hash = "foo";
    process.nextTick(hash.disable);
  });

  wit("should change the hash", function(done) {
    var hash = window.hashable.hash()
      .data({path: "foo", bar: 1})
      .write();
    assert.equal(window.location.hash, "#foo?bar=1");
    done();
  });

  wit("should read the hash", function(done) {
    window.location.hash = "?bar=2";
    var hash = window.hashable.hash()
      .read();
    assert.deepEqual(hash.data(), {path: "", bar: 2});
    done();
  });

  wit("should disable and re-enable itself", function(done) {
    var hash = window.hashable.hash()
      .change(function(e) {
        throw "This should be disabled.";
      })
      .disable();
    window.location.hash = "path/to/foo?bar=baz";
    hash
      .change(function(e) {
        assert.deepEqual(e.data, {path: "path/to/foo", bar: "qux"});
        done();
      })
      .enable();
    window.location.hash = "path/to/foo?bar=qux";
    process.nextTick(hash.disable);
  });

  wit("should get the hash right on check()", function(done) {
    window.location.hash = "name/shawn";
    var hash = window.hashable.hash()
      .format("name/{name}")
      .default({
        name: "joe"
      })
      .change(function(e) {
        assert.equal(e.data.name, "shawn");
        done();
      })
      .check();
  });

  wit("should use default data in check() if there's no hash", function(done) {
    window.location.hash = "";
    var hash = window.hashable.hash()
      .format("name/{name}")
      .default({
        name: "shawn"
      })
      .change(function(e) {
        assert.equal(e.data.name, "shawn");
        done();
      })
      .check();
  });

  describe("should handle fragment identifiers properly", function() {

    var div,
        hash;

    wit("shouldn't set data for valid fragment identifiers", function(done) {
      div = window.document.createElement("div");
      div.id = "help";
      window.document.querySelector("body").appendChild(div);

      window.location.hash = "help";

      hash = window.hashable.hash()
        .format("widget/{widget}")
        .valid(window.hashable.validFragment)
        .default({
          widget: "foo"
        })
        .change(function(e) {
          assert.equal(e.url, "help");
          assert.equal(e.data, null);
          done();
        })
        .check();
    });

    wit("should set default data for a bad hash", function(done) {
      hash
        .change(function(e) {
          assert.deepEqual(e.data, {widget: "foo"});
          done();
        })
        .enable();
      window.location.hash = "wadget";
      process.nextTick(hash.disable);
    });

    wit("should still parse the format", function(done) {
      hash
        .change(function(e) {
          assert.deepEqual(e.data, {widget: "bar"});
          done();
        })
        .enable();
      window.location.hash = "widget/bar";
      process.nextTick(hash.disable);
    });

    wit("shouldn't respect fragment identifiers for missing elements", function(done) {
      div.parentNode.removeChild(div);
      hash
        .change(function(e) {
          assert.deepEqual(e.data, {widget: "foo"});
          done();
        })
        .enable();
      window.location.hash = "help";
      process.nextTick(hash.disable);
    });
  });

  wit("should do what the README says", function(done) {
    window.location.hash = "";

    var hash = window.hashable.hash()
      .change(function(e) {
        assert.deepEqual(e.data, {path: "path/to/foo", bar: "hi"});
        changed = true;
      })
      .enable();

    hash.set({path: "path/to/foo", bar: "hi"});
    assert.equal(window.location.hash, "#path/to/foo?bar=hi");

    process.nextTick(function() {
      assert.equal(changed, true, "change callback not called");
      done();
    });
  });

});
