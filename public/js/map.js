//var map = L.map('mymap').setView([43.1045, 12.3895], 13);


/*
var OSM_layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
{attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'}).addTo(map);
*/
var map = L.map('map').fitWorld();
var layerGroup = L.layerGroup().addTo(map);
var layerGroupPos = L.layerGroup().addTo(map);
//var layerRoute = L.layerGroup().addTo(map);
var position;
var count = 0;
var editing = false;
var routes = []; 

//carica e inizializza la mappa base
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiaXBlenp1IiwiYSI6ImNrMG54Ym1rZjA0OWszbm8weTlyNGlnd3cifQ.Ra3q6EDY1jvEeGFFcFHdAQ'
}).addTo(map);


function onLocationFound(e) {

    layerGroupPos.clearLayers();
    var radius = e.accuracy / 2;
    position = e.latlng;
    //console.log(position.lat);

    //var marker = L.marker(e.latlng).addTo(map)

    var marker = L.marker(e.latlng)
    marker.addTo(layerGroupPos);

    var circle = L.circle(e.latlng, radius);
    circle.addTo(layerGroupPos);

    marker.bindPopup("Ti trovi qui in un raggio di " + radius + " metri").openPopup();


    //L.circle(e.latlng, radius).addTo(map);

    //+++GET NEARBY PLACES+++
    /*
    var gj = L.geoJson(GEOJSON_DATA);
    var nearest = leafletKnn(gj).nearest(L.latLng(position[0], position[1]), 5);
    console.log(nearest);
    */

    //return position;
    //initialize();

}

function onLocationError(e) {
    alert(e.message);
}

function addRoute() {
    if (!editing) {
        alert("modalità edit attivata");
        editing = true;
        routes = [position];
        document.getElementById("createRoute").className = "btn btn-success btn-circle btn-lg";
        document.getElementById("routeIcon").className = "glyphicon glyphicon-ok";


    } else {
        alert("modalità edit disattivata");
        editing = false;

        L.Routing.control({
            waypoints: routes,
            createMarker: function() { return null; }
        }).addTo(map);

        document.getElementById("createRoute").className = "btn btn-warning btn-circle btn-lg";
        document.getElementById("routeIcon").className = "glyphicon glyphicon-road";


    }
}

/*
//FUNZIONI DI GOOGLE MAPS PER LOCALIZZARE I NEARBY PLACES
function initialize() {
	console.log("in init: " + position.lat);
	var pyrmont = new google.maps.LatLng({lat: position.lat, lng: position.lng});

	var request = {
		location: pyrmont,
	    radius: '500',
	    type: ['restaurant']
	};

	service = new google.maps.places.PlacesService(document.createElement('div'));
	service.nearbySearch(request, callback);
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
  		for (var i = 0; i < results.length; i++) {
    		var nearbyMarker = L.marker([results[0].geometry.location.lat(),results[0].geometry.location.lng()]);
    		nearbyMarker.addTo(layerGroup);
    	}
  	}
}
*/

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

map.on('moveend', function(e) {
    layerGroup.clearLayers();
    bounds = map.getBounds(); //posizioni latlong per BBox
    c1lat = bounds._northEast.lat;
    c1lng = bounds._northEast.lng;
    c2lat = bounds._southWest.lat;
    c2lng = bounds._southWest.lng;
    urlOverpass = "https://overpass-api.de/api/interpreter?data=[out:json];(node['tourism'](" + c2lat + "," + c2lng + "," + c1lat + "," + c1lng + ");way['tourism'](" + c2lat + "," + c2lng + "," + c1lat + "," + c1lng + ");node['tourism'](" + c2lat + "," + c2lng + "," + c1lat + "," + c1lng + ");<;);out meta;";

    //var orangeMarker = L.AwesomeMarkers.icon({markerColor: 'orange'});

    $.ajax({
        type: "GET",
        dataType: "json",
        url: urlOverpass,
        //url: "https://overpass-api.de/api/interpreter?data=[out:json];(node(11,50,11.1,50.1);<;);out meta;",
        success: function(data) {
            //data = JSON.parse(data);
            var routeEl = 1;
            count += 1;
            console.log("richiesta overpass #" + count);
            //console.log(urlOverpass);
            if (data.elements.length != 0) {
                var exceed = 0;
                $.each(data.elements, function(index, el) {
                    console.log(el);
                    if (el.tags) {
                        if (el.tags.name && el.tags.tourism) {
                            exceed += 1;
                            if (exceed > 30) {
                                return false;
                            }
                            //console.log(el.tags);
                            //creazione del marker per ogni singolo punto di interesse
                            var markerLocation = new L.LatLng(el.lat, el.lon);

                            var redMarker = L.ExtraMarkers.icon({
                                icon: 'fa-coffee',
                                markerColor: 'orange',
                                shape: 'square',
                                prefix: 'fa'
                            });

                            var marker = L.marker(markerLocation, {
                                icon: redMarker
                            });

                            marker.addTo(layerGroup).on('click', function(e) {
                                if (editing) {
                                    routes.push(markerLocation);
                                    $.toast({
                                        title: 'A small bitesize snack, not a toast!',
                                        type: 'info',
                                        delay: 5000
                                    });
                                }
                            });

                            var tags = el.tags;

                            console.log("marker #" + exceed);

                            if (el.tags["addr:city"] && el.tags["addr:country"] && el.tags["addr:housenumber"] && el.tags["addr:postcode"] && el.tags["addr:street"]) {
                                marker.bindPopup("Questo posto e': " + el.tags.name + "<br>" + el.tags["addr:street"] + ", " + el.tags["addr:housenumber"] + ", " + el.tags["addr:postcode"] + " " + el.tags["addr:city"] + " " + el.tags["addr:country"]);
                            } else {
                                marker.bindPopup("Questo posto e': " + el.tags.name);
                            }

                        }
                    }
                });
            } else {
                console.log("nessun risultato trovato");
            }

        }
    });
});

//var bbox = map.getView().calculateExtent(olmap.getSize());
//console.log(bbox);


//LOCALIZZA LA POSIZIONE
map.locate({
    setView: true,
    watch: true,
    maxZoom: 14
});

