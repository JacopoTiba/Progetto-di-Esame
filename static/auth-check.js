function getCookie(name) {
    const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
    if (!match) return null;
    try {
        return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
    } catch {
        return null;
    }
}

function checkAuth() {
    const utente = getCookie('utente');
    if (!utente) {
        window.location.href = 'index.html';
    }
    return utente;
}