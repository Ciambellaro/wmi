//var map = L.map('mymap').setView([43.1045, 12.3895], 13);
		 
		
		/*
		var OSM_layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
		{attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'}).addTo(map);
		*/

		var map = L.map('map').fitWorld();
		var layerGroup = L.layerGroup().addTo(map);
		var position;

		//carica e inizializza la mappa base
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 18,
			id: 'mapbox.streets',
			accessToken: 'pk.eyJ1IjoiaXBlenp1IiwiYSI6ImNrMG54Ym1rZjA0OWszbm8weTlyNGlnd3cifQ.Ra3q6EDY1jvEeGFFcFHdAQ'
		}).addTo(map);


		function onLocationFound(e) {
			layerGroup.clearLayers(); //cancella i precedenti markers e circles

			var radius = e.accuracy / 2;
			position = e.latlng;
			console.log(position.lat);

			//var marker = L.marker(e.latlng).addTo(map)

			var marker = L.marker(e.latlng)
			marker.addTo(layerGroup);

			var circle = L.circle(e.latlng, radius);
			circle.addTo(layerGroup);

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

			$.ajax({
        		type: "GET",
        		dataType: "jsonp",
        		//url: "http://overpass-api.de/api/interpreter?data=[out:json];(node(11.254528,44.477110,11.282208,44.488576);<;);out meta;",
        		url: "http://overpass-api.de/api/interpreter?data=[out:json];(node(11,50,11.1,50.1);<;);out meta;",
        		success: function(data){
                    console.log("ENTRATO!");
        		}
    		})

		}

		function onLocationError(e) {
			alert(e.message);
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

		//var bbox = map.getView().calculateExtent(olmap.getSize());
		//console.log(bbox);

		//LOCALIZZA LA POSIZIONE
		map.locate({setView: true, watch: true, maxZoom: 16});