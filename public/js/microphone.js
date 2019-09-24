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

    function openMenu(){
        $('#clipMenu').modal('show');
    }
