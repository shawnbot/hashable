(function(exports) {

  L.hash = function() {
    var hash = curio.hash()
      .format(curio.format.map())
      .enable();

    var moveend, zoomend, viewreset;

    hash.onAdd = function(map) {
      hash.change(function(e) {
        var view = e.data;
        console.log("view:", view);
        map.setView([view.y, view.x], view.z);
      })
      .enable();

      map
        .on("moveend", moveend = function() {
          var c = map.getCenter();
          hash.update({x: c.lng, y: c.lat})
            .write();
        })
        .on("zoomend", zoomend = function() {
          var z = map.getZoom();
          hash.update({z: z})
            .write();
        })
        .on("viewreset", viewreset = function() {
          var c = map.getCenter(),
              z = map.getZoom();
          hash.update({x: c.lng, y: c.lat, z: z})
            .write();
        });
    };

    hash.onRemove = function(map) {
      hash.change(null).disable();
      map
        .off("moveend", moveend)
        .off("zoomend", zoomend)
        .off("viewreset", viewreset);
    };

    hash.addTo = function(map) {
      map.addLayer(hash);
      return hash;
    };

    return hash;
  };

})();
