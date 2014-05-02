---
title: hashable / API
layout: api
---

### <a id="hashable.hash">#</a> hashable.hash()
The `hashable.hash()` function returns an object that manages *state
data* data via the browser&rsquo;s `location.hash`. Typical usage
looks like:

```js
var hash = hashable.hash()
  .change(function(e) {
  })
  .enable()
  .check();
```

#### <a id="hash.check">#</a> hash.check()
The `hash.check()` function is the suggested way to initialize your
state data. It first checks `location.hash` to see if the page has
loaded with a URL to parse, and attempts to parse it if so.
Otherwise, it uses the [default data](#hash.default) to set
`location.hash` according to its [format](#hash.format).

#### [#](#hash.data) hash.data()
Calling `hash.data()` with an object sets its state data, and calling
it without any arguments returns the current state data object:

```js
hash.state({widget: "foo"});  // set the state, returns the `hash` object
hash.state();                 // returns: {widget: "foo"}
```

**Please note** that the setter *does not* update `location.hash`
automatically! You must call [hash.write](#hash.write) after
setting the data, or call [hash.set](#hash.set).

#### [#](#hash.default) hash.default()
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

#### [#](#hash.enable) hash.enable()
#### [#](#hash.disable) hash.disable()

#### [#](#hash.format) hash.format
#### [#](#hash.parse) hash.parse

#### [#](#hash.read) hash.read
#### [#](#hash.set) hash.set
#### [#](#hash.update) hash.update
#### [#](#hash.write) hash.write
#### [#](#hash.url) hash.url

#### [#](#hash.href) hash.href
#### [#](#hash.href.merge) hash.href.merge
#### [#](#hash.href.parse) hash.href.parse

- hashable.hash
  - hash.check
  - hash.data
  - hash.disable
  - hash.enable
  - hash.format
  - hash.href
  - hash.href.merge
  - hash.href.parse
  - hash.parse
  - hash.read
  - hash.set
  - hash.update
  - hash.url
  - hash.write
- hashable.format
  - format.match
  - format.parse
  - format.query
- name: hashable.format.path
  children:
  - path.match
  - path.parse
- name: hashable.format.map
  children:
  - map.precision
- name: hashable.validFragment
- name: Utility functions
  href: #utils
  children:
  - hash.extend
  - hash.diff
  - hash.copy
  - hash.empty
  - hash.functor

### [#](#plugins) Plugins

#### [#](#leaflet) Leaflet
