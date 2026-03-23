export function mostraMessaggio(testo, tipo) {
    const box = document.getElementById('messaggio-box');
    box.innerText = testo;
    box.style.color = (tipo === 'successo') ? 'green' : 'red';
}

export function attivaBoxCodice() {
    document.getElementById('form-login').style.display = 'none';
    document.getElementById('form-verifica').style.display = 'block';
}