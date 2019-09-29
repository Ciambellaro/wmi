var addClipMode = false;

function addClip() {
    if (!addClipMode) {
        //modalità aggiungi clip attivata
        addClipMode = true;
        document.getElementById("createRoute").disabled = true;

        $.toast({
            heading: 'Informazione',
            text: 'Clicca su un lugo d interesse per aggiungere una clip',
            showHideTransition: 'slide',
            position: 'bottom-center',
            icon: 'info'
        });

        document.getElementById("createClip").className = "btn btn-success btn-circle btn-lg";
        document.getElementById("clipIcon").className = "glyphicon glyphicon-ok";


    } else {
        //modalità aggiungi clip disattivata
        addClipMode = false;
        document.getElementById("createRoute").disabled = false;


            $.toast({
                heading: 'Ok, fatto!',
                text: 'Modalità di aggiunta clip disattivata',
                showHideTransition: 'slide',
                position: 'bottom-center',
                icon: 'success'
            });
        }


        document.getElementById("createClip").className = "btn btn-warning btn-circle btn-lg";
        document.getElementById("clipIcon").className = "glyphicon glyphicon-forward";

    }

    function openMenu(nome, coordinate){
        $('#clipMenu').modal('show');
        $('#nomeTitolo').html(nome);
        $('#coord').html(coordinate);
    }

// *********************** GESTIONE RECORDER VIDEO **********************************

/*let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");
let logElement = document.getElementById("log");

let recordingTimeMS = 60000;  // registra fino ad un minuto


function log(msg) {
  logElement.innerHTML += msg + "\n";
}


function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}


function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let data = [];
 
  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();
  log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");
 
  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state == "recording" && recorder.stop()
  );
 
  return Promise.all([
    stopped,
    recorded
  ])
  .then(() => data);
}


function stop(stream) {
  stream.getTracks().forEach(track => track.stop());
}

startButton.addEventListener("click", function() {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    preview.srcObject = stream;
    downloadButton.href = stream;
    preview.captureStream = preview.captureStream || preview.mozCaptureStream;
    return new Promise(resolve => preview.onplaying = resolve);
  }).then(() => startRecording(preview.captureStream(), recordingTimeMS))
  .then (recordedChunks => {
    let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    recording.src = URL.createObjectURL(recordedBlob);
    downloadButton.href = recording.src;
    downloadButton.download = "RecordedVideo.webm";
    
    log("Successfully recorded " + recordedBlob.size + " bytes of " +
        recordedBlob.type + " media.");
  })
  .catch(log);
}, false); 


stopButton.addEventListener("click", function() {
  stop(preview.srcObject);
}, false);*/

let constraintObj = { 
  audio: true, 
  video: { 
      facingMode: "user", 
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 } 
  } 
}; 
// width: 1280, height: 720  -- preference only
// facingMode: {exact: "user"}
// facingMode: "environment"

//handle older browsers that might implement getUserMedia in some way
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
  navigator.mediaDevices.getUserMedia = function(constraintObj) {
      let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }
      return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraintObj, resolve, reject);
      });
  }
}else{
  navigator.mediaDevices.enumerateDevices()
  .then(devices => {
      devices.forEach(device=>{
          console.log(device.kind.toUpperCase(), device.label);
          //, device.deviceId
      })
  })
  .catch(err=>{
      console.log(err.name, err.message);
  })
}


navigator.mediaDevices.getUserMedia(constraintObj)
.then(function(mediaStreamObj) {
  //connect the media stream to the first video element
  let video = document.querySelector('video');
  if ("srcObject" in video) {
      video.srcObject = mediaStreamObj;
  } else {
      //old version
      video.src = window.URL.createObjectURL(mediaStreamObj);
  }
  
  video.onloadedmetadata = function(ev) {
      //show in the video element what is being captured by the webcam
      video.play();
  };
  
  //add listeners for saving video/audio
  let start = document.getElementById('startButton');
  let stop = document.getElementById('stopButton');
  let vidSave = document.getElementById('recording');
  let mediaRecorder = new MediaRecorder(mediaStreamObj);
  let chunks = [];
  
  start.addEventListener('click', (ev)=>{
      mediaRecorder.start();
      console.log(mediaRecorder.state);
  })
  stop.addEventListener('click', (ev)=>{
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
  });
  mediaRecorder.ondataavailable = function(ev) {
      chunks.push(ev.data);
  }
  mediaRecorder.onstop = (ev)=>{
      let blob = new Blob(chunks, { 'type' : 'video/mp4;' });
      chunks = [];
      let videoURL = window.URL.createObjectURL(blob);
      console.log("@@@@@@@@@@@@@@@@@@@@@@ " + videoURL);
      vidSave.src = videoURL;
  }
})
.catch(function(err) { 
  console.log(err.name, err.message); 
});