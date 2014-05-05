---
title: hashable
layout: default
---

# hashable
Hashable is a little JavaScript library that makes it easy to add
**stateful URLs** to your web application. Stateful URLs allow
visitors to bookmark or share URLs of a specific view (or "state"),
defined by one or more unique values. Check out the [API reference](api/) for
more info, or read on below for a quick primer.

## The hash object
Out of the box, the `hashable.hash()` object provides a straightforward way to
save and restore your app's state as a JavaScript object with scalar values:

```js
var hash = hashable.hash()
  .change(function(e) {
    console.log("new state:", JSON.stringify(e.data));
  })
  .check();
```

Whenever the `#` suffix of the URL changes in your browser (either by
setting `location.hash` in JavaScript or when the visitor clicks on a link with
an href that begins in `#`), the new URL is parsed according to the hash's
[format](#formats) and the change function gets called with an event object
containing the parsed data:

```js
location.hash = "?widget=foo";
// logs: 'new state: {"widget": "foo"}'
location.hash = "?widget=foo&size=big";
// logs: 'new state: {"widget": "foo", "size": "big"}'
```

## Formats
Formats are declarative ways to define how a URL gets parsed *and* formatted,
in the style of [d3&rsquo;s formatting
functions](https://github.com/mbostock/d3/wiki/Formatting). By default,
`hashable.hash()` uses an empty format that recognizes [query
string](http://en.wikipedia.org/wiki/Query_string) parameters:

```js
var format = hashable.format("")
  .query(true);
format({widget: "foo", size: "small"});
// returns: "?widget=foo&size=small"
format.parse("?widget=bar&size=medium");
// returns: {widget: "bar", size: "medium"}
```

But these don't produce very pretty URLs. Alternatively, you can call
`hashable.format()` with a string template that contains *named placeholders*
for data property values, and returned format will both produce and parse
prettier URLs:

```js
var format = hashable.format("widgets/{widget}/{size}");
format({widget: "foo", size: "large"});
// returns: "widgets/foo/large"
format.parse("widget/bar/small");
// returns: {widget: "bar", size: "small"}
```

These "pretty" formats don't recognize query string parameters by default, but
you can cause them to by simply calling `format.query(true)`:

```js
// without query support:
format({widget: "foo", size: "large", color: "red"})
// returns: "widgets/foo/large"

format.query(true);
format({widget: "foo", size: "large", color: "red"})
// returns: "widgets/foo/large?color=red"
```

And, when you're satisfied with your format, you can tell your `hash` object to
use it:

```js
var format = hashable.format("widgets/{widget}/{size}"),
    hash = hashable.hash()
      .format(format);

// or:
hash.format("widgets/{widget}/{size}");
```
