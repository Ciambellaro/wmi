//APRE IL MODAL DEL VIDEO
function play() {
    $('#ModalVideoPlayer').modal('show');
    var $videoSrc = "https://www.youtube.com/embed/" + idVideo;
    idVideo = "";
    //quando si chiude il modal, si stoppa il video 
    $('#ModalVideoPlayer').on('hide.bs.modal', function (e) {
        $("#video").attr('src', ""); //viene modificato il src del video, così da non riprodurne nessuno
    });

    //autoplay del video all'apertura del modal
    $('#ModalVideoPlayer').on('shown.bs.modal', function (e) {
        $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");  // set the video src to autoplay and not to show related video.
    });
}