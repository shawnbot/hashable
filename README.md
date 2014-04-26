# curio

URI parsing, formatting, and hash manipulations in the browser!

## Hash manipulation

Curio can manipulate the browser's location hash, allowing you to read and write state to the URL without reloading the page:

```js
// create your hash manipulator and add a change listener
var hash = curio.hash()
  .change(function(e) {
    console.log("hash data:", e.data);
  })
  .read();
  
hash.update({path: "path/to/foo", bar: "hi"});
// this doesn't update the hash automatically, but this will:
hash.write();
// location.hash should now equal:
// "path/to/foo?bar=hi"
// and you should see a console.log():
// "hash data: {path: 'path/to/foo', bar: 'hi'}"
```

### Parsers and Formatters

`curio.hash()` can use whatever parsing and formatting logic you throw at it, but it comes with some helpful primitives:

**curio.format.path()** is the default format, and it parses `location.hash` into an object like so:

```js
var fmt = curio.format.path();
fmt({path: "foo/bar"}); // "foo/bar"
fmt.parse("foo/bar"); // {path: "foo/bar"}
fmt({path: "foo/bar", baz: "qux"}); // "foo/bar?baz=qux"
fmt.parse("foo/bar?baz=qux"); // {path: "foo/bar", baz: "qux"}
```

**curio.format()** allows you to more specifically define a path format as a Mustache-like string:

```js
var fmt = curio.format("type/{type}");
fmt({type: "foo"}); // "type/foo"
fmt.parse("type/bar"); // {type: "bar"}
```

**curio.format.map()** is made for slippy maps like [Leaflet](http://leafletjs.com). The nice thing about this approach is that you can link to points on the map by adding an anchor to your page with an href in the format `{zoom}/{l:

```js
var hash = curio.hash()
  .format(curio.format.map())
  .change(function(e) {
    var data = e.data;
    console.log("moving to:", data);
    map.setView([data.y, data.x], data.z);
  })
  .enable();

var map = L.map("map")
  .on("moveend", function() {
    var center = map.getCenter();
    hash.update({x: center.lng, y: center.lat})
      .write();
  })
  .on("zoomend", function() {
    hash.update({z: map.getZoom()})
      .write();
  });

new L.StamenTileLayer("toner").addTo(map);

if (location.hash) {
  hash.read();
} else {
  map.setView([51.505, -0.09], 13);
}
```

## Usage

### Browser

Just drop [curio.js](https://raw.githubusercontent.com/shawnbot/curio/master/curio.js) (or the minified [curio.min.js](https://raw.githubusercontent.com/shawnbot/curio/master/curio.min.js)) into the `<head>` of your
HTML document, and access it via the global `curio` object.

```
<html>
<head>
<script src="curio.js"></script>
</head>
</html>
```

### Node.js

Just install via [npm](http://npmjs.org):

```sh
$ npm install curio
```

and require away:

```
var curio = require("curio");
```
