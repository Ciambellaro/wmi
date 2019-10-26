//apertura modal al caricamento della pagina
$(window).on('load', function () {
    $('#modalLoginForm').modal({ backdrop: 'static', keyboard: false });
});

//se le credenziali sono giuste, avviare la mappa
function login() {
    var user = $("input[type='text']").val();
    var pwd = $("input[type='password']").val();
    if (user == "admin" && pwd == "admin") {
        sessionStorage.setItem("toPass", "adm"); //permette di accedere alla variabile toPass = a da altre pagine html
        window.location.assign("/map");
    } else if (user == "user" && pwd == "user") {
        sessionStorage.setItem("toPass", "usr"); //permette di accedere alla variabile toPass = user da altre pagine html
        window.location.assign("/map");
    } else {
        window.alert("Credenziali errate!");
    }
}

//apre il modale per la registrazione
function openModalsignin() {
    $('#modalRegisterForm').modal('show');
}



//ti fa registrare se username univoco e se password e conferma password sono uguali
/*function signin() {
    var userIns = $("input[id='username']").val();
    var pwdconf = $("input[id='pwdconf']").val();
    var pwdIns = $("input[id='pwd']").val();
    var tipoIns = $("input[name='tipologia']:checked").val();

    if (pwdconf == pwdIns && pwdIns != "") {
        
        alert("Account registrato!");
    } else {
        alert("Errore nel confermare la Password");
    }
}*/


