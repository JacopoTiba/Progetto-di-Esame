export async function apiLogin(email, password) {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) // Il server riceve 'email' e 'password'
    });
    return await response.json();
}

export async function apiRichiediCodice(email) {
    const response = await fetch('/api/richiedi-codice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return await response.json();
}