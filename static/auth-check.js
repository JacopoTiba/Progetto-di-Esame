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

// Iniezione dinamica degli stili CSS per l'avatar della navbar
(function injectAvatarStyles() {
    const styles = `
        .nav-avatar-img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 50% !important;
            display: block !important;
        }
        
        .btn-avatar:has(.nav-avatar-img), 
        .nav-btn:has(.nav-avatar-img) {
            padding: 0 !important;
            overflow: hidden !important;
            border: 2px solid var(--gold-soft, #dcc9a1) !important;
        }
        
        .btn-avatar:has(.nav-avatar-img):hover,
        .nav-btn:has(.nav-avatar-img):hover {
            border-color: var(--gold, #c9a96e) !important;
            box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.2) !important;
        }

        /* Stili per nav-btn-pill (usato in writeStory ed editStory) */
        .nav-btn-pill:has(.nav-avatar-img) {
            padding: 4px 12px 4px 6px !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            overflow: visible !important;
        }
        
        .nav-btn-pill .nav-avatar-img {
            width: 24px !important;
            height: 24px !important;
            border: 1.5px solid var(--gold-soft, #dcc9a1) !important;
            border-radius: 50% !important;
        }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
})();

// Caricamento dell'immagine del profilo nella navbar
async function loadNavAvatar() {
    const user = getCookie('utente');
    if (!user || !user.email) return;

    const avatarLink = document.getElementById('navAvatar');
    if (!avatarLink) return;

    try {
        const res = await fetch(`/api/utenti/email/${encodeURIComponent(user.email)}`);
        if (!res.ok) return;
        const utente = await res.json();

        if (utente.avatar) {
            const svg = avatarLink.querySelector('.avatar-fallback-icon');
            
            const img = document.createElement('img');
            img.src = utente.avatar;
            img.alt = 'Avatar';
            img.className = 'nav-avatar-img';

            if (svg) {
                svg.parentNode.replaceChild(img, svg);
            } else {
                if (!avatarLink.querySelector('.nav-avatar-img')) {
                    avatarLink.prepend(img);
                }
            }
        }
    } catch (err) {
        console.error('Errore caricamento avatar navbar:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadNavAvatar);

// ─── Logout globale ───────────────────────────────────────────────────────────
function logout() {
    document.cookie = 'utente=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = 'index.html';
}

// Aggancia automaticamente tutti i bottoni .btn-logout presenti nella pagina
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-logout, #btnLogout').forEach(btn => {
        btn.addEventListener('click', logout);
    });
});