//apertura modal login al caricamento della pagina
$(window).on('load', function () {
    $('#modalLoginForm').modal({ backdrop: 'static', keyboard: false }); //modal viene mostrato e non può scomparire
});

//apre il modale per la registrazione
function openModalsignin() {
    $('#modalRegisterForm').modal('show');
}



