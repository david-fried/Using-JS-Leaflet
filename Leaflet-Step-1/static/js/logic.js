// Earthquake data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";


 // Define streetmap and darkmap layers
 var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
var baseMaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap
  };
  

// Create our map, giving it the streetmap and earthquakes layers to display on load
var myMap = L.map("map", {
    center: [ 37.09, -95.71 ],
    zoom: 5,
    layers: [streetmap]     //default selected layer
    });

streetmap.addTo(myMap);


// create layer; attach data later on
var earthquakes = new L.LayerGroup();


// Create overlay object to hold our overlay layer
var overlayMaps = {
  Earthquakes: earthquakes
};


// Create a layer control
// Pass in baseMaps and overlayMaps
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


// Function for assigning color to values
function getColor(d) {
  return d > 90  ? '#d73027' :
         d > 70  ? '#fc8d59' :
         d > 50   ? '#fee08b' :
         d > 30   ? '#d9ef8b' :

         d >= 10  ?  '#91cf60' :
                      '#1a9850';
}


// Create a legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);


// Define the style of circleMarkers
function styleMag(feature) {
  var geojsonMarkerOptions = {
    radius: feature.properties.mag * 3,
    fillColor: getColor(feature.geometry.coordinates[2]),
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
  return geojsonMarkerOptions;
}


// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {

  L.geoJSON(data, {
 
    pointToLayer: function(feature, latlng) {

        return L.circleMarker(latlng).bindPopup(
        "<p>" + new Date(feature.properties.time) + "</p><hr>" +
        "<p><strong>Location:</strong> " + feature.properties.place + "</p>" +
        "<p><strong>Magnitude:</strong> " + feature.properties.mag + "</p>" +
        "<p><strong>Depth:</strong> " + feature.geometry.coordinates[2] + " Kilometers</p>"
        );
      },
      
    style: styleMag
    
  }).addTo(earthquakes);

  
  earthquakes.addTo(myMap);
  
});