async function caricaUtente() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('Utente non trovato!');
        window.location.href = 'home.html';
        return;
    }

    try {
        const res = await fetch(`/api/utenti/${id}`);

        if (!res.ok) {
            alert('Utente non trovato!');
            window.location.href = 'home.html';
            return;
        }

        const utente = await res.json();

        // Profilo
        document.title = `Plotty – ${utente.username}`;
        document.querySelector('.profile-handle').textContent = `@${utente.username}`;
        document.querySelector('.profile-name').innerHTML = `${utente.nome} <em>${utente.cognome}</em>`;

        // Numero storie
        document.querySelector('.stat-num').textContent = utente.storie.length;
        document.querySelector('.section-count').textContent = `${utente.storie.length} racconti`;

        // Griglia storie
        const grid = document.querySelector('.story-grid');
        grid.innerHTML = '';

        if (utente.storie.length === 0) {
            grid.innerHTML = '<p>Nessuna storia pubblicata.</p>';
            return;
        }

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
                        <p class="card-author">di ${utente.username}</p>
                        <p class="card-desc">${storia.descrizione || 'Nessuna descrizione disponibile.'}</p>
                        <div class="card-footer">
                            <a href="story.html?id=${storia.id}" class="btn-read">Leggi →</a>
                            <div class="card-stats">
                                <span class="stat-pill">
                                    <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    ${storia.capitoli}
                                </span>
                                <span class="stat-pill">
                                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                    ${storia.nLike}
                                </span>
                            </div>
                        </div>
                    </div>
                </article>
            `;
            grid.innerHTML += card;
        });

    } catch (err) {
        console.error('Errore nel caricamento del profilo:', err);
        alert('Errore nel caricamento del profilo!');
        window.location.href = 'home.html';
    }

    // Carica libri preferiti dell'utente
    try {
        const res2 = await fetch(`/api/utenti/${id}/preferiti`);
        const favoriteData = await res2.json();
        const preferiti = favoriteData.preferiti || [];
        
        const favGrid = document.getElementById('favoritesGrid');
        const favCount = document.getElementById('favCount');
        
        if (preferiti.length === 0) {
            favGrid.innerHTML = '<p class="empty-state">Nessun libro aggiunto ai preferiti.</p>';
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
    } catch (err) {
        console.error('Errore nel caricamento dei preferiti:', err);
        document.getElementById('favoritesGrid').innerHTML = '<p class="empty-state">Errore nel caricamento dei preferiti.</p>';
    }
}

document.addEventListener('DOMContentLoaded', caricaUtente);