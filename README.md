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

**curio.format.map()** is made for slippy maps like [Leaflet](http://leafletjs.com). This allows you to save the center and zoom of the map (its location on the Earth) in the URL, allowing people to share specific views. This approach also allows you to link directly to map views with anchor tags, using an href in the format `#{zoom}/{lat}/{lng}`.

You can use the handy Leaflet plugin (bundled as of v1.3.0) like so:

```html
var map = L.map("map")
      .setView([37.7691, -122.4399], 11),
    hash = L.hash()
      .addTo(map)
      .check();
```

Or you can adapt the [standalone example](https://github.com/shawnbot/curio/blob/master/examples/leaflet-basic.html) to your favorite map engine.

## Browser Usage

Just drop [curio.js](https://raw.githubusercontent.com/shawnbot/curio/master/curio.js) (or the minified [curio.min.js](https://raw.githubusercontent.com/shawnbot/curio/master/curio.min.js)) into the `<head>` of your
HTML document, and access it via the global `curio` object.

```
<!DOCTYPE html>
<html>
  <head>
    <script src="curio.js"></script>
  </head>
</html>
```

## Using with Node.js

Just install via [npm](http://npmjs.org):

```sh
$ npm install curio
```

and require away:

```
var curio = require("curio");
```
