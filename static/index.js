"use strict";

$(document).ready(function () {
    const loginForm = $(".login-form");

    loginForm.on("submit", async function (e) {
        e.preventDefault(); // Impedisce il ricaricamento della pagina

        const email = $("#email").val();
        const password = $("#password").val();

        console.log("Tentativo di login per:", email);

        // Chiamata al server Flask usando la tua funzione in libreria.js
        // libreria.js trasformerà "/login" in "/api/login"
        let response = await inviaRichiesta("POST", "/login", {
            "email": email,
            "password": password
        });

        if (response.status === 200) {
            alert("Login OK! Risposta del server: " + JSON.stringify(response.data));
            // Qui potrai fare il redirect, ad esempio:
            // window.location.href = "home.html";
        } else {
            alert("Errore durante il login: " + (response.err || "Server non raggiungibile"));
        }
    });

    // Gestione del tasto Google (solo estetica per ora)
    $(".btn-google").on("click", function() {
        alert("Accesso con Google non ancora implementato!");
    });
});