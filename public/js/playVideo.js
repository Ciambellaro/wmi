var idVideo;
var filterPurpose;
var filterLan;
var pos
var lista = [];

function getJson(p, flag) {  // richiesta alla API YTSearch
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + p + "&type=video&key=AIzaSyDreBoGIWh_o3liIimrcRFJF3R5M2xqOlw",
    success: function (data) {
      pos = p;
      var jsonList = data;
      var numResults = jsonList.pageInfo.totalResults;
      if (numResults > 0) {
        for (var i = 0; i < numResults; i++) {
          lista.push(jsonList.items[i].snippet.description + "#" + jsonList.items[i].id.videoId);
        }
        console.log(lista);
        play(); // fa partire effettivamente il video
      } else if (numResults == 0 && flag != true) {
        $('#noCLipModal').modal('show');
      }

    }
  })
}


function play() {
  var index = 0;
  var $videoSrc;
  var tmpList = [];
  filterPurpose = "what";
  filterLan = "ita";
  for (var i = 0; i < lista.length; i++) { // di default i video visualizzati sono i WHAT e ITA
    var split = lista[i].split(":");
    var s = lista[i].split("#");
    if (split[1] == filterPurpose && split[2] == filterLan) {
      tmpList.push(s[1]);
    }
  }
  $videoSrc = "https://www.youtube.com/embed/" + tmpList[index];

  if (activeRoute == false) {
    document.getElementById("btnPrev").style.visibility = "hidden";
    document.getElementById("btnNext").style.visibility = "hidden";
  } else {
    document.getElementById("btnPrev").style.visibility = "visible";
    document.getElementById("btnNext").style.visibility = "visible";
  }

  //autoplay del video all'apertura del modal
  $('#ModalVideoPlayer').on('shown.bs.modal', function (e) {
    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");  // set the video src to autoplay and not to show related video.
  });

  // CAMBIA LA LISTA DA CUI IFRAME PRENDE I VIDEO FILTRATA PER SCOPO
  $("select.filterPurpose").change(function () {
    var selectedPurpose = $(this).children("option:selected").val();
    tmpList = [];
    console.log("FILTERLAN PRIMA: " + filterLan);
    switch (selectedPurpose) {
      case "how":
        filterPurpose = "how";
        index = 0;
        break;
      case "why":
        filterPurpose = "why";
        index = 0;
        break;
      default:
        filterPurpose = "what";
        index = 0;
    }

    for (var i = 0; i < lista.length; i++) {
      var split = lista[i].split(":");
      var s = lista[i].split("#");
      if (split[1] == filterPurpose && split[2] == filterLan) {
        tmpList.push(s[1]);
      }

    }
    $videoSrc = "https://www.youtube.com/embed/" + tmpList[index]; //aggiorna il link con il primo video della lista filtrata
    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
  });

  // CAMBIA LA LISTA DA CUI IFRAME PRENDE I VIDEO FILTRATA PER SCOPO
  $("select.filterLan").change(function () {
    var selectedPurpose = $(this).children("option:selected").val();
    console.log("Filtra per: " + filterLan);
    console.log("FILTERLAN PRIMA: " + filterLan);
    tmpList = [];
    switch (selectedPurpose) {
      case "eng":
        filterLan = "eng";
        index = 0;
        break;
      case "deu":
        filterLan = "deu";
        index = 0;
        break;
      case "fra":
        filterLan = "fra";
        index = 0;
        break;
      case "esp":
        filterLan = "esp";
        index = 0;
        break;
      default:
        filterLan = "ita";
        index = 0;
    }

    console.log("FILTERLAN DOPO: " + filterLan);

    for (var i = 0; i < lista.length; i++) {
      var split = lista[i].split(":");
      var s = lista[i].split("#");
      if (split[1] == filterPurpose && split[2] == filterLan) {
        tmpList.push(s[1]);
      }

    }
    $videoSrc = "https://www.youtube.com/embed/" + tmpList[index]; //aggiorna il link con il primo video della lista filtrata
    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
  });

  $('#prevClip').click(function () {
    if (index == 0) {
      alert("Questa è la prima clip !");
    } else {
      index--;
      $videoSrc = "https://www.youtube.com/embed/" + tmpList[index];
      $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    }
  });

  $('#nextClip').click(function () {
    console.log("Index: " + index + "List dim: " + tmpList.length);
    if (index + 1 < tmpList.length) {
      index++;
      $videoSrc = "https://www.youtube.com/embed/" + tmpList[index];
      $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    } else {
      alert("Questa è l'ultima clip !");
    }
  });

  $('#reachThePlace').click(function () {
    $('#ModalVideoPlayer').modal('hide');
    if (currentRoute) {  //per rimuovere rettangolo bianco delle indicazioni stradali, se c'è
      currentRoute.setWaypoints([]);
      $('.leaflet-routing-container.leaflet-bar.leaflet-control').remove();
    }
    //var posAttuale = OpenLocationCode.encode(position.lat, position.lng);
    routes = [position];
    var dec = OpenLocationCode.decode(pos);
    //LatLng(44.487981, 11.315192)
    var meta = new L.LatLng(dec.latitudeCenter, dec.longitudeCenter);
    routes.push(meta);
    currentRoute = L.Routing.control({
      waypoints: routes,
      createMarker: function () {
        return null;
      }
    }).addTo(map);
    activeRoute = true;
    document.getElementById("cancelRoute").style.visibility = "visible";
  });

  $('#ModalVideoPlayer').modal('show');
}

// chiusura modal
$('#ModalVideoPlayer').on('hidden.bs.modal', function () {  // svuota gli array di video quando il modal viene chiuso                 // altrimenti il contenuto degli array si duplica ogni volta che si clicca su play
  $("#video").attr('src', ""); //viene modificato il src del video, così da non riprodurne nessuno
  whatVideo = [];
  howVideo = [];
  whyVideo = [];
});


