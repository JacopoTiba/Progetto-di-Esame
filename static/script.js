import * as api from './backend.js';
import * as ui from './frontend.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GESTIONE LOGIN (index.html) ---
    const loginForm = document.querySelector('.login-form');
    const emailLoginInput = document.getElementById('email');

    if (loginForm && emailLoginInput) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = emailLoginInput.value;
            const password = document.getElementById('password').value;

            try {
                const res = await api.apiLogin(email, password);
                if (res.message === "login riuscito") {
                    ui.mostraMessaggio("Accesso eseguito! Benvenuto.", "successo");
                    setTimeout(() => {
                        window.location.href = "home.html";
                    }, 1200);
                } else {
                    ui.mostraMessaggio(res.message, "errore");
                }
            } catch (error) {
                ui.mostraMessaggio("Server non raggiungibile!", "errore");
            }
        });
    }

    // --- 2. GESTIONE REGISTRAZIONE (register.html) ---
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nome = document.getElementById('reg-nome').value;
            const cognome = document.getElementById('reg-cognome').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('pass').value;
            const conferma = document.getElementById('conf-pass').value;

            if (password !== conferma) {
                ui.mostraMessaggio("Le password non coincidono!", "errore");
                return;
            }

            try {
                const response = await fetch('/api/registrazione', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, cognome, email, password })
                });

                const data = await response.json();
                
                if (response.ok) {
                    ui.mostraMessaggio("Codice inviato! Verifica la mail.", "successo");
                    
                    // MOSTRA IL POPUP INVECE DI FARE IL REDIRECT
                    const modal = document.getElementById('otp-modal');
                    modal.style.display = 'flex';

                    // GESTIONE DEL TASTO DENTRO IL POPUP
                    document.getElementById('btn-conferma-otp').onclick = async () => {
                        const codice = document.getElementById('otp-input').value;
                        
                        const resVerifica = await fetch('/api/verifica-codice', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, codice })
                        });

                        if (resVerifica.ok) {
                            alert("Account attivato! Ora puoi fare il login.");
                            window.location.href = "index.html";
                        } else {
                            const errorData = await resVerifica.json();
                            const errorText = document.getElementById('otp-error');
                            errorText.innerText = errorData.message;
                            errorText.style.display = 'block';
                        }
                    };
                } else {
                    ui.mostraMessaggio(data.message, "errore");
                }
            } catch (error) {
                ui.mostraMessaggio("Errore server!", "errore");
            }
        });
    }
});