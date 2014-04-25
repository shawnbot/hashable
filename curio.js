(function(curio) {

  curio.version = "0.0.0";

  curio.hash = function(loc) {
    if (!loc) loc = window.location;

    var hash = function(selection) {
          window.addEventListener("hashchange", change);
        },
        data = {},
        current,
        format = curio.format.path(),
        parse = format.parse,
        onchange = function() { };

    hash.data = function(d) {
      if (!arguments.length) return data;
      data = d;
      return hash;
    };

    hash.update = function(d) {
      curio.extend(data, d);
      return hash;
    };

    hash.write = function(d) {
      loc.hash = format(data);
      return hash;
    };

    hash.read = function() {
      change();
      return hash;
    };

    hash.format = function(fmt) {
      if (!arguments.length) return format;
      format = fmt;
      if (typeof format.parse === "function") {
        parse = format.parse;
      }
      return hash;
    };

    hash.parse = function(fn) {
      if (!arguments.length) return parse;
      parse = fn;
      return hash;
    };

    hash.url = function(d, merge) {
      if (!arguments.length) d = data;
      if (merge) d = curio.extend({}, data, d);
      return "#" + format(d);
    };

    hash.disable = function(selection) {
      window.removeEventListener("hashchange", change);
    };

    hash.change = function(callback) {
      if (!arguments.length) return onchange;
      onchange = callback;
      return hash;
    };

    hash.href = function(selection) {
      selection.on("click.curio", function(d) {
        this.href = hash.url(d);
      });
    };

    hash.href.parse = function(d) {
      return parse(this.getAttribute("href").substr(1));
    };

    hash.href.merge = function(selection) {
      selection.on("click.curio", function(d) {
        this.href = hash.url(d, true);
      });
    };

    function change() {
      // console.log("change():", current, "->", loc.hash);
      if (loc.hash != current) {
        var previous = data;
        data = parse.call(loc, loc.hash.substr(1));
        var diff = curio.diff(data, previous);
        if (diff) {
          onchange.call(hash, {
            data: data,
            previous: previous,
            diff: diff
          });
        }
      }
    }

    return hash;
  };

  curio.format = function(fmt) {
    if (!fmt) fmt = "";

    var query = false,
        keys = [],
        pattern = new RegExp("^" + fmt.replace(/{(\w+)}/g, function(_, key) {
          keys.push(key);
          return "(\\w+)";
        }) + "$");

    var format = function(data) {
      var used = [];
          str = fmt.replace(/{(\w+)}/g, function(_, key) {
            return data[key];
          });

      if (!query) return str;

      var qkeys = Object.keys(data)
        .filter(function(key) {
          return keys.indexOf(key) === -1;
        });
      return qkeys.length
        ? [str, curio.qs.format(curio.copy(data, qkeys))].join("?")
        : str;
    };

    format.match = function(str) {
      if (query) {
        str = str.split("?", 2)[0];
      }
      return str.match(pattern);
    };

    format.parse = function(str) {
      var qdata;
      if (query) {
        var bits = str.split("?", 2);
        str = bits[0];
        qdata = curio.qs.parse(bits[1]);
        if (qdata) {
          if (Array.isArray(query)) {
            qdata = curio.copy(qdata, query);
          } else {
            // copy only the keys that aren't in the format
            var qkeys = Object.keys(qdata)
              .filter(function(key) {
                return keys.indexOf(key) === -1;
              });
            qdata = curio.copy(qdata, qkeys);
          }
        }
      }
      var match = format.match(str);
      if (match) {
        var data = {};
        keys.forEach(function(key, i) {
          data[key] = match[i + 1];
        });
        if (qdata) curio.extend(data, qdata);
        return data;
      }
      return null;
    };

    format.query = function(q) {
      if (!arguments.length) return query;
      query = q;
      return format;
    };

    format.toString = function() {
      return fmt;
    };

    return format;
  };

  curio.format.path = function() {

    var format = function(data) {
      data = curio.extend({}, data);
      var path = data.path || "";
      delete data.path;
      var query = curio.qs.format(data);
      return query
        ? [path, query].join("?")
        : path;
    };

    format.match = function(str) {
      return true;
    };

    format.parse = function(str) {
      var bits = str.split("?", 2),
          data = {path: bits[0]};
      if (bits.length > 1) {
        var query = curio.qs.parse(bits[1]);
        if (query) {
          return curio.extend(data, query);
        }
      }
      return data;
    };

    return format;
  };

  /*
   * query string parse & format
   */
  curio.qs = (function() {
    var qs = {
      separator: "&",
    };

    var replacements = qs.replacements = {
      "%20": "+",
      "%2C": ","
    };

    qs.parse = function(str) {
      if (!str || str === "?") return null;
      if (str.charAt(0) === "?") str = str.substr(1);
      var data = {};
      str.split(qs.separator)
        .forEach(function(bit) {
          var parts = bit.split("=", 2),
              key = decode(parts[0]);
          if (parts.length === 1) {
            data[key] = true;
          } else {
            data[key] = decode(parts[1]);
          }
        });
      return data;
    };

    qs.format = function(data, sortKeys) {
      if (typeof data === "string") return data;
      else if (data === null || typeof data === "undefined") return "";

      var keys = Object.keys(data)
        .filter(function(key) {
          return !curio.empty(data[key]);
          return (data[key] !== null)
              && (typeof data[key] !== "undefined");
        });
      if (sortKeys) {
        keys = keys.sort(function(a, b) {
          return a > b ? 1 : a < b ? -1 : 0;
        });
      }
      var bits = keys.map(function(key) {
        return (data[key] === true)
          ? key
          : [key, encode(data[key])].join("=");
      });
      return bits.length
        ? bits.join(qs.separator)
        : "";
    };

    function encode(d) {
      return encodeURIComponent(d)
        .replace(/(\%[A-F0-9]{2})/g, function(_, hex) {
          return hex in replacements
            ? replacements[hex]
            : hex;
        });
    }

    function decode(str) {
      return decodeURIComponent(str.replace(/\+/g, " "));
    }

    return qs;
  })();

  /*
   * extend an object with one or more other objects' keys
   */
  curio.extend = function(a, b, etc) {
    [].slice.call(arguments, 1).forEach(function(o) {
      if (!o) return;
      for (var key in o) {
        a[key] = o[key];
      }
    });
    return a;
  };

  /*
   * find the difference (non-recursive) between two objects,
   * returned as an array of objects like:
   *
   * {op: "remove", value: <value>}
   * a key was set in the first object, but not set in the second.
   *
   * {op: "change", value: [<value>, <value>]}
   * a key was changed between the first and second object. value[0] is the
   * original, and value[1] is the changed value.
   *
   * {op: "add", value: <value>}
   * a key was set in the second object but not the first.
   */
  curio.diff = function(a, b) {
    var ak = Object.keys(a || {}),
        bk = Object.keys(b || {}),
        diff = {};
    while (ak.length) {
      var key = ak.shift(),
          i = bk.indexOf(key);
      if (i === -1) {
        diff[key] = {op: "remove", value: a[key]};
      } else if (b[key] != a[key]) {
        diff[key] = {op: "change", value: [a[key], b[key]]};
        bk.splice(i, 1);
      } else {
        bk.splice(i, 1);
      }
    }
    while (bk.length) {
      var key = bk.shift();
      diff[key] = {op: "add", value: b[key]};
    }
    return (Object.keys(diff).length > 0)
      ? diff
      : null;
  };

  curio.copy = function(obj, keys) {
    var copy = {};
    keys.forEach(function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

  curio.empty = function(d) {
    return (d === null)
        || (typeof d === "undefined")
        || d.length === 0;
  };

})(typeof module === "object" ? module.exports : this.curio = {});
