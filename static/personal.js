// Carica profilo personale dell'utente loggato
async function caricaProfiloPersonale() {
    try {
        // Ottieni l'utente dal cookie
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith('utente='));
        
        if (!match) {
            window.location.href = 'index.html';
            return;
        }

        const utenteData = JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
        const email = utenteData.email;

        // Carica profilo per email
        const res = await fetch(`/api/utenti/email/${email}`);
        if (!res.ok) {
            console.error('Errore API:', res.status);
            // Se l'endpoint non esiste, mostra i dati dal cookie
            mostraProfiloDaCookie(utenteData);
            mostraPreferiti([]);
            return;
        }

        const utente = await res.json();

        // Aggiorna profilo
        document.title = `Plotty – Il Mio Profilo`;
        document.querySelector('.profile-handle').textContent = `@${utente.username}`;
        document.querySelector('.profile-name').innerHTML = `${utente.nome} <em>${utente.cognome}</em>`;

// Carica profilo personale dell'utente loggato
async function caricaProfiloPersonale() {
    try {
        // Ottieni l'utente dal cookie
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith('utente='));
        
        if (!match) {
            window.location.href = 'index.html';
            return;
        }

        const utenteData = JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
        const email = utenteData.email;

        // Carica profilo per email
        const res = await fetch(`/api/utenti/email/${email}`);
        if (!res.ok) {
            console.error('Errore API email:', res.status);
            // Se l'endpoint non esiste, mostra i dati dal cookie
            mostraProfiloDaCookie(utenteData);
            mostraPreferiti([]);
            return;
        }

        const utente = await res.json();

        // Aggiorna profilo
        document.title = `Plotty – Il Mio Profilo`;
        document.querySelector('.profile-handle').textContent = `@${utente.username}`;
        document.querySelector('.profile-name').innerHTML = `${utente.nome} <em>${utente.cognome}</em>`;

        // Numero storie
        document.querySelector('.stat-num').textContent = utente.storie.length;
        document.querySelector('.section-count').textContent = `${utente.storie.length} racconti`;

        // Griglia storie personali
        const grid = document.querySelector('.story-grid');
        grid.innerHTML = '';

        if (utente.storie.length === 0) {
            grid.innerHTML = '<p>Nessuna storia pubblicata. <a href="writeStory.html">Scrivi la tua prima storia!</a></p>';
        } else {
            utente.storie.forEach(storia => {
                const card = `
                    <article class="story-card">
                        <div class="card-thumb">
                            <div class="card-thumb-img" 
                                 style="background-image:url('${storia.imgStoria}');">
                            </div>
                            <span class="card-genre">${storia.genere}</span>
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${storia.titolo}</h3>
                            <p class="card-author">by ${utente.nome}</p>
                            <p class="card-desc">${storia.descrizione || 'Nessuna descrizione disponibile.'}</p>
                            <div class="card-footer">
                                <a href="story.html?id=${storia.id}" class="btn-read">Leggi →</a>
                                <div class="card-actions-personal">
                                    <button class="btn-edit" data-id="${storia.id}">✏️ Modifica</button>
                                    <button class="btn-delete" data-id="${storia.id}">🗑️ Elimina</button>
                                </div>
                            </div>
                        </div>
                    </article>
                `;
                grid.innerHTML += card;
            });
        }

        // Carica libri preferiti
        mostraPreferiti([]);

    } catch (err) {
        console.error('Errore nel caricamento del profilo personale:', err);
        mostraPreferiti([]);
    }
}

// Fallback: mostra profilo dai dati del cookie
function mostraProfiloDaCookie(utenteData) {
    document.title = `Plotty – Il Mio Profilo`;
    document.querySelector('.profile-handle').textContent = `@${utenteData.username || 'Utente'}`;
    document.querySelector('.profile-name').innerHTML = `${utenteData.nome || ''} <em>${utenteData.cognome || ''}</em>`;
    document.querySelector('.stat-num').textContent = '0';
    document.querySelector('.section-count').textContent = '0 racconti';
    
    const grid = document.querySelector('.story-grid');
    grid.innerHTML = '<p>Caricamento storie... <a href="writeStory.html">Scrivi la tua prima storia!</a></p>';
}

// Mostra preferiti (per ora sempre vuoti finché l'API non è disponibile)
function mostraPreferiti(preferiti) {
    const favGrid = document.getElementById('favoritesGrid');
    const favCount = document.getElementById('favCount');
    
    if (!favGrid || !favCount) return;
    
    if (preferiti.length === 0) {
        favGrid.innerHTML = '<p class="empty-state">Nessun libro aggiunto ai preferiti. Scopri storie interessanti nella <a href="home.html">home</a>!</p>';
        favCount.textContent = '0 libri';
        return;
    }

    favCount.textContent = `${preferiti.length} libr${preferiti.length === 1 ? 'o' : 'i'}`;
    favGrid.innerHTML = '';

    preferiti.forEach(libro => {
        const favCard = `
            <article class="favorite-card">
                <div class="fav-thumb">
                    <img src="${libro.imgStoria}" alt="${libro.titolo}" 
                         onerror="this.src='img/story-1.jpg'"/>
                    <span class="fav-genre">${libro.genere}</span>
                    <button class="btn-remove-fav" data-id="${libro.id}" aria-label="Rimuovi dai preferiti">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                <div class="fav-body">
                    <h3 class="fav-title">${libro.titolo}</h3>
                    <p class="fav-author">di ${libro.autore || 'Autore sconosciuto'}</p>
                    <p class="fav-desc">${libro.descrizione || 'Nessuna descrizione disponibile.'}</p>
                    <a href="story.html?id=${libro.id}" class="btn-read-fav">Leggi →</a>
                </div>
            </article>
        `;
        favGrid.innerHTML += favCard;
    });
}

document.addEventListener('DOMContentLoaded', caricaProfiloPersonale);
