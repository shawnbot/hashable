# hashable

Save and restore state in the browser's `location.hash`, parse and format URLs, and more! See the [API reference](http://shawnbot.github.io/hashable/api/) for more info.

[![Build Status](https://travis-ci.org/shawnbot/hashable.svg?branch=master)](https://travis-ci.org/shawnbot/hashable)

## Hash manipulation

Hashable can manipulate the browser's location hash, allowing you to read and write state to the URL without reloading the page:

```js
// create your hash manipulator and add a change listener
var hash = hashable.hash()
  .change(function(e) {
    console.log("hash data:", e.data);
  })
  .enable();

// you can set the hash programmatically:
hash.set({path: "path/to/foo", bar: "hi"});
// location.hash should now equal:
// "path/to/foo?bar=hi"

// you can disable and re-enable hashchange event listening:
hash.disable();
hash.enable();

// you can set the default URL data as either an object literal or a function:
hash.default({foo: "bar"});
hash.default(function() {
  return {foo: someCondition ? "bar" : "baz"};
});

// and check() does the dirty work of reading location.hash if it's set,
// or writing location.hash with either the current or default value:
hash.check();
```

### Parsers and Formatters

`hashable.hash()` can use whatever parsing and formatting logic you throw at it, but it comes with some helpful primitives:

<a name="hashable.format.path" href="#hashable.format.path">#</a> **hashable.format.path()** is the default format, and it parses `location.hash` into an object like so:

```js
var fmt = hashable.format.path();
fmt({path: "foo/bar"}); // "foo/bar"
fmt.parse("foo/bar"); // {path: "foo/bar"}
fmt({path: "foo/bar", baz: "qux"}); // "foo/bar?baz=qux"
fmt.parse("foo/bar?baz=qux"); // {path: "foo/bar", baz: "qux"}
```

<a name="hashable.format" href="#hashable.format">#</a> **hashable.format()** allows you to more specifically define a path format as a Mustache-like string:

```js
var fmt = hashable.format("type/{type}");
fmt({type: "foo"}); // "type/foo"
fmt.parse("type/bar"); // {type: "bar"}
```

<a name="hashable.format.map" href="#hashable.format.map">#</a> **hashable.format.map()** is made for slippy maps like [Leaflet](http://leafletjs.com). This allows you to save the center and zoom of the map (its location on the Earth) in the URL, allowing people to share specific views. This approach also allows you to link directly to map views with anchor tags, using an href in the format `#{zoom}/{lat}/{lng}`.

<a name="L.hash" href="#L.hash">#</a> You can use the handy **L.hash** Leaflet plugin (bundled as of v1.3.0) like so:

```js
var map = L.map("map")
      .setView([37.7691, -122.4399], 11),
    hash = L.hash()
      .addTo(map)
      .check();
```

Or you can adapt the [standalone example](https://github.com/shawnbot/curio/blob/master/examples/leaflet-basic.html) to your favorite map engine.

## Browser Usage
Just drop [hashable.js](https://raw.githubusercontent.com/shawnbot/hashable/master/hashable.js) (or the minified [hashable.min.js](https://raw.githubusercontent.com/shawnbot/hashable/master/hashable.min.js)) into the `<head>` of your
HTML document, and access it via the global `hashable` object.

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="hashable.js"></script>
  </head>
  <body>
    <script>
      var hash = hashable.hash();
    </script>
  </body>
</html>
```

You can aslo install the JavaScript locally with [Bower](http://bower.io/):

```sh
$ bower install hashable
```

## Using with Node.js
Just install via [npm](http://npmjs.org):

```sh
$ npm install hashable
```

and require away:

```
var hashable = require("hashable");
```
