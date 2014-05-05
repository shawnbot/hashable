---
title: hashable / API
layout: api
---

### Common Conventions

As you&rsquo;ll see below, `hashable.hash()` and other objects are
designed for [chaining](http://schier.co/post/method-chaining-in-javascript),
which simply means that most methods return the object instance. These
objects expose most of their parameters as *getter/setter* functions,
which serve a dual purpose: when called with no arguments they return
the value of a particular property (such as [a hash&rsquo;s
format](#hash.format)); whereas if they get an argument they set the
corresponding property value internally. These conventions should be
familiar to users of [jQuery](http://jquery.com) or [d3](http://d3js.org).

### <a id="hashable.hash">#</a> hashable.hash()
The `hashable.hash()` function returns an object that manages *state
data* via the browser&rsquo;s `location.hash`. Here is a typical usage:

```js
var hash = hashable.hash()
  .change(function(e) {
    // this gets called whenever the hash changes
  })
  .enable()
  .check();
```

#### <a id="hash.change">#</a> hash.change(*callback*)
Register a single *callback* function to be called whenever the hash
changes, *and* when initialized by [hash.check](#hash.check). This
can either be an inline function or a function reference:

```js
hash.change(function(e) {
});
// or 
function hashchange(e) {
}
hash.change(hashchange);
```

The *callback* function receives a single argument: an "event" object
with the following properties:

* `url`: the URL as parsed, without the leading `#`
* `data`: the state data as parsed
* `previous`: the previous state data
* `diff`: an object listing state data properties that changed
  between the `previous` and current objects.

**Please note that the state data is stored in `event.data`, not in
the event object itself.**

##### Data diffs
The `diff` property in the change callback&rsquo;s event argument
tells you which properties of the state data have changed since the
last time the hash was read. The diff is a JavaScript object with one
property (or "key") per property that was added, removed or changed.
This object can be used to check whether specific values have changed
and avoid performing potential costly operations on ones that
haven&rsquo;t. Here&rsquo;s an example:

```js
location.hash = "widgets/foo/small";
var hash = hashable.hash()
  .format("widgets/{widget}/{size}")
  .change(function(e) {
    if (e.data) {
      showWidget(e.data.widget);
      setWidgetSize(e.data.size);
    }
  })
  .enable()
  .check();
```

Let&rsquo;s assume that the `showWidget()` function is costly in some
way&mdash;maybe it triggers an AJAX request, or triggers transitions
or animations&mdash;but that `setWidgetSize()` can be called
repeatedly without any weird side effects (in other words, it&rsquo;s
[idempotent](http://en.wikipedia.org/wiki/Idempotence)). In this
case, we could rewrite our change callback like so:

```js
hash.change(function(e) {
  if (e.data) {
    if (e.diff.widget) showWidget(e.data.widget);
    if (e.diff.size) setWidgetSize(e.data.size);
  }
});
```

This way, the `showWidget()` function only gets called when the value
of `e.data.widget` has changed&mdash;and we don&rsquo;t have to do
any complicated comparison of the previous and current values in the
change callback. Hooray!

#### <a id="hash.check">#</a> hash.check()
The `hash.check()` function is the suggested way to initialize your
state data. It first checks `location.hash` to see if the page has
loaded with a URL to parse, and attempts to parse it if so.
Otherwise, it uses the [default data](#hash.default) to set
`location.hash` according to its [format](#hash.format).

#### <a id="hash.data">#</a> hash.data(*[data]*)
Calling `hash.data()` with an object sets its state data, and calling
it without any arguments returns the current state data object:

```js
hash.state({widget: "foo"});  // set the state, returns the `hash` object
hash.state();                 // returns: {widget: "foo"}
```

**Please note** that the setter *does not* update `location.hash`
automatically. You must call [hash.write](#hash.write) after
setting the data, or call [hash.set](#hash.set).

#### <a id="hash.default">#</a> hash.default(*[default]*)
The `hash.default()` function gets or sets the manager&rsquo;s
default state data. The setter accepts either an object literal or a
function:

```js
hash.default({widget: "foo"});
hash.default(function() {
  return {widget: "some dynamic value"};
});
```

If a default is provided, it will be used to by
[hash.check](#hash.check) to set `location.hash` using the specified
[format](#hash.format).

#### <a id="hash.enable">#</a> hash.enable()
Enable the listening of `hashchange` events.

**Please note** that hash managers are *not* enabled by default.

#### <a id="hash.disable">#</a> hash.disable()
Disable the listening of `hashchange` events. You may wish to do this
if you&rsquo;re temporarily monkeying with `location.hash` and
don&rsquo;t want to deal with change callbacks, or if you&rsquo;re
replacing one hash manager with another.

#### <a id="hash.format">#</a> hash.format(*[format]*)
Get or set the format string or formatting function for the hash. If
the formatting function has a `parse()` method (such as those
returned by [hash.format](#hash.format) and its brethren will), the
hash mangager will use that, too. The setter form accepts either a
function or a string, the latter of which is converted into a
formatting function with [hashable.format](#hashable.format):

```js
// these are equivalent:
hash.format("widgets/{widget}");
hash.format(hashable.format("widgets/{widget}"));

// this is not, because the format supports query parameters:
var format = hashable.format("widgets/{widget}")
  .query(true);
hash.format(format);
```

Remember that any old function will suffice, as long as it takes an
object as its first argument and returns a string. For instance, if
you wish to have your state data formatted and parsed as JSON:

```js
hash.format(JSON.stringify);
hash.parse(JSON.parse);
```

#### <a id="hash.parse">#</a> hash.parse(*[parse]*)
The `parse()` method complements [hash.format](#hash.format),
allowing you to get or set the function used to parse URLs into state
data. You won&rsquo;t need to use this method in conjunction with any
of hashable&rsquo;s built-in formatters because they also provide a
`parse()` method of their own (following a convention established by
[d3](https://github.com/mbostock/d3/wiki/Formatting)), but if writing
your own URL format you may wish to define the formatting and parsing
functions separately.

```js
// this is how you might implement a path format
// similar to hashable.format.path()
hash.format(function(data) {
  return data.join("/");
});
hash.parse(function(url) {
  return url.split("/");
});
```

#### <a id="hash.read">#</a> hash.read()
Force the hash manager to read `location.hash` and call the change
function if it differs from the most recent value.

```js
hash.read();
```

#### <a id="hash.set">#</a> hash.set(*value*)
Set the state data value either as an object or a string and update
`location.hash` accordingly. If *value* is a string, `location.hash`
is set to that value and a change event will only be triggered if it
differs from the previous value.

```js
var hash = hashable.hash()
  .format("widgets/{widget}");
hash.set("widgets/foo");
// hash.data() should now be: {widget: "foo"}
hash.set({widget: "bar"});
// hash.data() should now be: {widget: "bar"}
```

If you&rsquo;re looking to merge values into or modify the current
state, check out [hash.update](#hash.update).

#### <a id="hash.update">#</a> hash.update(*[data]*)
Merge the keys of the object *data* into the current state data, and
do nothing else. This is useful in the event that you wish to add or
remove a single property value from the state without having to know
the other values.

```js
var hash = hashable.hash()
  .data({widget: "bar"})
  .update({size: "small"});
// hash.data() now returns: {widget: "bar", size: "small"}
```

**Please note** that automatic setting of `location.hash` isn&rsquo;t
done here so that you can update the state data multiple times
without having to manage intermediate state changes. When
you&rsquo;re done, just call [hash.write](#hash.write).

#### <a id="hash.url">#</a> hash.url(*data[, merge]*)
This function produces URLs from state data. If *merge* is true, the
provided state data is merged with the manager&rsquo;s current state,
which allows you to specify only the values that you wish to change
in the URL. `hash.url()` can be used to create links on your page
that modify the state:

```js
var hash = hashable.hash()
  .format("widgets/{widget}/{size}")
  .data({widget: "foo", size: "small"});

document.querySelector("a.widget-bar")
  .setAttribute("href", hash.url({widget: "bar", size: "medium"}));
document.querySelector("a.medium")
  .setAttribute("href", hash.url({size: "medium"}, true));
```

For more link-related magic, check out [hash.href](#hash.href).

#### <a id="hash.write">#</a> hash.write(*value*)
Set the state data *value* and update `location.hash` immediately.

#### <a id="hash.href">#</a> hash.href()
**This function and its children are intended for use with
[d3](http://d3js.org) selections.**

`hash.href()` adds a `click` handler to the nodes in the selection
that sets their `href` property to the return value of
[hash.url](#hash.url). For instance:

```js
var hash = hashable.hash()
  .format("widgets/{widget}");

var link = d3.select("#links")
  .selectAll("a.widget")
  .data(["foo", "bar", "baz"].map(function(widget) {
    return {widget: widget};
  })
  .enter()
  .append("a")
    .call(hash.href);
```

#### <a id="hash.href.merge">#</a> hash.href.merge()
Similar to [hash.href](#hash.href) the `hash.href.merge()` can be
used to set hrefs on links, but by merging each link&rsquo;s bound
datum with the hash&rsquo;s current state data:

```js
var hash = hashable.hash()
  .format("widgets/{widget}/{size}");

d3.selectAll("a.size")
  .datum(function() {
    // data-size="medium" -> {size: "medium"}
    return this.dataset;
  })
  .call(hash.href.merge);
```

#### <a id="hash.href.parse">#</a> hash.href.parse()
The purpose of this function is to parse `#`-prefixed href values as
state data, which can then be bound back to DOM nodes for use with
[hash.href](#hash.href) and [hash.href.merge](#hash.href.merge). This
is useful for making HTML with stateful links dynamic, so that
whenever one is clicked its href is updated (before being read by the
browser) to reflect the current state:

```js
var hash = hashable.hash()
  .data({widget: "foo", size: "small"})

d3.select("body")
  .append("a")
    .attr("href", "#?size=small")
    .datum(hash.href.parse)
    .call(hash.href.merge);
```


### <a id="hashable.format">#</a> hashable.format(*[format]*)

#### <a id="format.call">#</a> format(*data*)
#### <a id="format.match">#</a> format.match(*url*)
#### <a id="format.parse">#</a> format.parse(*url*)
#### <a id="format.query">#</a> format.query(*[boolean]*)


### <a id="hashable.format.path">#</a> hashable.format.path()

#### <a id="path.call">#</a> path(*data*)
#### <a id="path.match">#</a> path.match(*url*)
#### <a id="path.parse">#</a> path.parse(*url*)


### <a id="hashable.format.map">#</a> hashable.format.map()

#### <a id="map.call">#</a> map(*data*)
#### <a id="map.match">#</a> map.match(*url*)
#### <a id="map.parse">#</a> map.parse(*url*)
#### <a id="map.precision">#</a> map.precision(*[precision]*)


### <a id="hashable.validFragment">#</a> hashable.validFragment(*url*)


### <a id="utils">#</a> Utility functions

#### <a id="hashable.copy">#</a> hashable.copy(*obj[, keys]*)
#### <a id="hashable.diff">#</a> hashable.diff(*a, b*)
#### <a id="hashable.empty">#</a> hashable.empty(*value*)
#### <a id="hashable.extend">#</a> hashable.extend(*a, b[, c[, ...]]*)
#### <a id="hashable.functor">#</a> hashable.functor(*value*)


### [#](#plugins) Plugins

#### [#](#leaflet) Leaflet
Hashable comes bundled with a [Leaflet](http://leafletjs.com) plugin
that exposes a handler at `L.hash`, which can be used like so:

```js
var map = L.map("div", {...}),
    hash = L.hash()
      .addTo(map);
// or:
map.addLayer(hash);
```

`L.hash()` objects are just `hashable.hash()` objects with additional
methods that expose Leaflet&rsquo;s [ILayer
interface](http://leafletjs.com/reference.html#ilayer). If you want
to listen for change events (for instance, to capture [query
string](#format.query) parameters), you can listen for `hashchange`
events *on the map object*:

```js
map.on("hashchange", function(e) {
  console.log("hash change:", e.data);
});
```

You can change the [URL format](#hash.format) of `L.hash()`
instances, but be sure to include the `{z}`, `{x}` and `{y}`
placeholders (zoom, longitude and latitude, respectively) so that the
map knows where to go.
