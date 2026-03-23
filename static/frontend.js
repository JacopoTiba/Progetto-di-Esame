export function mostraMessaggio(testo, tipo) {
    const box = document.getElementById('messaggio-box');
    
    if (box) {
        box.innerText = testo;
        box.style.color = (tipo === 'successo') ? 'green' : 'red';
        box.style.display = 'block';
    } else {
        // Se il box non esiste, usiamo un alert così non perdiamo l'info!
        alert(testo);
    }
}

export function attivaBoxCodice() {
    const modal = document.getElementById('otp-modal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.log("Modal non trovato, controllo i form...");
        // Backup per la vecchia logica se serve
        if(document.getElementById('form-login')) document.getElementById('form-login').style.display = 'none';
    }
}