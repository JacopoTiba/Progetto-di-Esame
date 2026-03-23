import * as api from './backend.js';
import * as ui from './frontend.js';

// Usiamo la classe della form per selezionarla
const form = document.querySelector('.login-form'); 

if (form) {
    form.addEventListener('submit', async (event) => {
        // BLOCCA il ricaricamento della pagina (niente più # nell'URL!)
        event.preventDefault(); 

        // Recupero i dati usando gli ID corretti dell'HTML
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value; // Era qui l'errore!

        try {
            // 1. Chiamata al login
            const res = await api.apiLogin(email, password);
            
            if (res.message === "login riuscito") {
                ui.mostraMessaggio("Login OK! Invio codice di verifica...", "successo");
                
                // 2. Chiamata per il codice 2FA via Mail
                const resCodice = await api.apiRichiediCodice(email);
                
                if (resCodice.message.includes("inviato")) {
                    ui.attivaBoxCodice(); 
                } else {
                    ui.mostraMessaggio("Errore mail: " + resCodice.message, "errore");
                }
            } else {
                ui.mostraMessaggio(res.message, "errore");
            }
        } catch (error) {
            console.error("Errore di rete:", error);
            ui.mostraMessaggio("Server non raggiungibile!", "errore");
        }
    });
}