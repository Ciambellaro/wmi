var idVideo;
var whatVideo = [];
var howVideo = [];
var whyVideo = [];
var pos;


function getPos(posizione) {
  pos = posizione;
}

function getJson() {  // richiesta alla API YTSearch
  $.ajax({
    type: "GET",
    dataType: "json",
    url: "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + pos + "&type=video&key=AIzaSyDreBoGIWh_o3liIimrcRFJF3R5M2xqOlw",
    success: function (data) {
      var jsonList = data;
      var numResults = jsonList.pageInfo.totalResults;
      if (numResults > 0) {
        for (var i = 0; i < numResults; i++) {
          var split = jsonList.items[i].snippet.description.split(":");
          var purpose = split[1];
          switch (purpose) {
            case "How":
              howVideo.push(jsonList.items[i].id.videoId);
              break;
            case "Why":
              whyVideo.push(jsonList.items[i].id.videoId);
              break;
            default:
              whatVideo.push(jsonList.items[i].id.videoId);
          }
        }
      }
      play(); // fa partire effettivamente il video
    }
  })
}


function play() {
  var index = 0;
  var $videoSrc;
  var list = whatVideo;  // di default i video visualizzati sono i WHAT
  $videoSrc = "https://www.youtube.com/embed/" + list[index];

  //autoplay del video all'apertura del modal
  $('#ModalVideoPlayer').on('shown.bs.modal', function (e) {
    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");  // set the video src to autoplay and not to show related video.
  });

  // CAMBIA LA LISTA DA CUI IFRAME PRENDE I VIDEO 
  $("select.filterPurpose").change(function () {
    var selectedPurpose = $(this).children("option:selected").val();
    console.log("Filtra per: " + selectedPurpose);
    switch (selectedPurpose) {
      case "How":
        list = howVideo;
        index = 0;
        break;
      case "Why":
        list = whyVideo;
        index = 0;
        break;
      default:
        list = whatVideo;
        index = 0;
    }

    $videoSrc = "https://www.youtube.com/embed/" + list[index]; //aggiorna il link con il primo video della lista filtrata
    $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
  });

  $('#prevClip').click(function () {
    if (index == 0) {
      alert("Questa è la prima clip !");
    } else {
      index--;
      $videoSrc = "https://www.youtube.com/embed/" + list[index];
      $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    }
  });

  $('#nextClip').click(function () {
    console.log("Index: "+ index+"List dim: "+list.length);
    if(index+1  < list.length) {
      index++;
      $videoSrc = "https://www.youtube.com/embed/" + list[index];
      $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    } else {
      alert("Questa è l'ultima clip !");
    }
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


