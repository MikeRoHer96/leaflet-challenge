// Create the 'basemap' tile layer that will be the background of our map.
let myMap = L.map("map").setView([0, 0], 2);

// Add the base layer from OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // Function to determine the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth > 90 ? "red" :        // Red for deep earthquakes
           depth > 70 ? "orange" :     // Orange for medium-deep
           depth > 50 ? "yellow" :     // Yellow for moderate depth
           depth > 30 ? "lightyellow" :// Light yellow for shallow
           depth > 10 ? "lightgreen" : // Green for very shallow
           "lightgreen";               // Light green for very shallow
  }

  // Function to determine the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude * 4;  // Adjust the size of the marker based on magnitude
  }

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      radius: getRadius(feature.properties.mag),  // Set radius based on magnitude
      fillColor: getColor(feature.geometry.coordinates[2]), // Set fill color based on depth
      color: "black",  // Outline color
      weight: 0.5,      // Outline thickness
      opacity: 1,       // Outline opacity
      fillOpacity: 0.8  // Fill opacity
    };
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, styleInfo(feature))  // Apply the styleInfo function to each feature
        .bindPopup(`<b>Location:</b> ${feature.properties.place}<br>
                    <b>Magnitude:</b> ${feature.properties.mag}<br>
                    <b>Depth:</b> ${feature.geometry.coordinates[2]} km<br>
                    <b>Date:</b> ${new Date(feature.properties.time)}`); // Popup with earthquake details
    }
  }).addTo(myMap);

  // Create a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    const depthRanges = [
      { range: "> 90", color: "red" },
      { range: "70-90", color: "orange" },
      { range: "50-70", color: "yellow" },
      { range: "30-50", color: "lightyellow" },
      { range: "10-30", color: "lightgreen" },
      { range: "< 10", color: "lightgreen" }
    ];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    depthRanges.forEach(function (range) {
      div.innerHTML +=
        '<i style="background:' + range.color + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i> ' +
        range.range + '<br>';
    });

    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(myMap);

});
