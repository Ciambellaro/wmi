$("#btnRegistrati").on("click", function () {
    $.post("/registrazione", function (data) {
        var res = JSON.parse(data);
        console.log("PRESO: " + res);
    });
})