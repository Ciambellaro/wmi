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
var currentRoute;

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
    //alert(e.message);
}

function addRoute() {
    if (!editing) {
        //alert("modalità edit attivata");
        editing = true;
        routes = [position];

        $.toast({
            heading: 'Informazione',
            text: 'Clicca su una meta per aggiungerla al percorso',
            showHideTransition: 'slide',
            position: 'bottom-center',
            icon: 'info'
        });

        document.getElementById("createRoute").className = "btn btn-success btn-circle btn-lg";
        document.getElementById("routeIcon").className = "glyphicon glyphicon-ok";


    } else {
        //alert("modalità edit disattivata");
        editing = false;

        if (currentRoute) {
            currentRoute.setWaypoints([]);
            $('.leaflet-routing-container.leaflet-bar.leaflet-control').remove();
        }

        if (routes.length > 1) {
            currentRoute = L.Routing.control({
                waypoints: routes,
                createMarker: function() { return null; }
            }).addTo(map);

            $.toast({
                heading: 'Perfetto!',
                text: 'Il percorso è stato creato correttamente',
                showHideTransition: 'slide',
                position: 'bottom-center',
                icon: 'success'
            });
        } else {
            $.toast({
                heading: 'Errore',
                text: 'Non è stato possbile creare il percorso in mancanza di una o più destinazioni',
                showHideTransition: 'fade',
                position: 'bottom-center',
                icon: 'error'
            });
        }


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
    urlOverpass = "https://lz4.overpass-api.de/api/interpreter?data=[out:json];(node['tourism'](" + c2lat + "," + c2lng + "," + c1lat + "," + c1lng + ");way['tourism'](" + c2lat + "," + c2lng + "," + c1lat + "," + c1lng + ");node['tourism'](" + c2lat + "," + c2lng + "," + c1lat + "," + c1lng + ");<;);out meta;";

    //var orangeMarker = L.AwesomeMarkers.icon({markerColor: 'orange'});

    $.ajax({
        type: "GET",
        dataType: "json",
        url: urlOverpass,
        //url: "https://overpass-api.de/api/interpreter?data=[out:json];(node(11,50,11.1,50.1);<;);out meta;",
        success: function(data) {
            //data = JSON.parse(data);
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

                            if(el.tags.tourism == 'hotel' || el.tags.tourism == 'guest_house') {
                                var redMarker = L.ExtraMarkers.icon({
                                    icon: 'fa-bed',
                                    markerColor: 'cyan',
                                    shape: 'square',
                                    prefix: 'fa'
                                });
                            } else if(el.tags.tourism == 'attraction') {
                                var redMarker = L.ExtraMarkers.icon({
                                    icon: 'fa-archway',
                                    markerColor: 'orange',
                                    shape: 'square',
                                    prefix: 'fa'
                                });
                            } else if(el.tags.tourism == 'museum') {
                                var redMarker = L.ExtraMarkers.icon({
                                    icon: 'fa-landmark',
                                    markerColor: 'red',
                                    shape: 'square',
                                    prefix: 'fa'
                                });
                            } else if(el.tags.tourism == 'information') {
                                var redMarker = L.ExtraMarkers.icon({
                                    icon: 'fa-info',
                                    iconColor: 'black',
                                    markerColor: 'white',
                                    shape: 'square',
                                    prefix: 'fa'
                                });
                            } else if(el.tags.tourism == 'artwork') {
                                var redMarker = L.ExtraMarkers.icon({
                                    icon: 'fa-monument',
                                    markerColor: 'yellow',
                                    shape: 'square',
                                    prefix: 'fa'
                                });
                            } else {
                                var redMarker = L.ExtraMarkers.icon({
                                    icon: 'fa-coffee',
                                    markerColor: 'green-light',
                                    shape: 'square',
                                    prefix: 'fa'
                                });
                            }

                            var marker = L.marker(markerLocation, {
                                icon: redMarker
                            });

                            var textToast = "Meta aggiunta alla lista";

                            marker.addTo(layerGroup).on('click', function(e) {
                                if (editing) {
                                    routes.push(markerLocation);
                                    $.toast({
                                        text: textToast, // Text that is to be shown in the toast
                                        heading: 'Aggiunta!', // Optional heading to be shown on the toast
                                        
                                        showHideTransition: 'fade', // fade, slide or plain
                                        allowToastClose: true, // Boolean value true or false
                                        hideAfter: 3000, // false to make it sticky or number representing the miliseconds as time after which toast needs to be hidden
                                        stack: 5, // false if there should be only one toast at a time or a number representing the maximum number of toasts to be shown at a time
                                        position: 'bottom-center', // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values
                                        
                                        bgColor: '#444444',  // Background color of the toast
                                        textColor: '#eeeeee',  // Text color of the toast
                                        textAlign: 'left',  // Text alignment i.e. left, right or center
                                        loader: true,  // Whether to show loader or not. True by default
                                        loaderBg: '#9EC600',  // Background color of the toast loader
                                        beforeShow: function () {}, // will be triggered before the toast is shown
                                        afterShown: function () {}, // will be triggered after the toat has been shown
                                        beforeHide: function () {}, // will be triggered before the toast gets hidden
                                        afterHidden: function () {}  // will be triggered after the toast has been hidden
                                    });
                                }

                                if(addClipMode){
                                    openMenu(el.tags.name, " " +markerLocation);
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

