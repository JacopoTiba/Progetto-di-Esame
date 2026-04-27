function getCurrentUser() {
    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('utente='));
    if (!match) return null;
    try {
        return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
    } catch {
        return null;
    }
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function bindSearch() {
    const form = document.querySelector('.search-form-right');
    const input = document.querySelector('.search-input');
    if (!form || !input) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = (input.value || '').trim();
        window.location.href = query ? `books.html?q=${encodeURIComponent(query)}` : 'books.html';
    });
}

function renderFavorites(preferiti) {
    const favGrid = document.getElementById('favoritesGrid');
    const favCount = document.getElementById('favCount');
    if (!favGrid || !favCount) return;

    favGrid.innerHTML = '';
    favCount.textContent = `${preferiti.length} libr${preferiti.length === 1 ? 'o' : 'i'}`;

    if (!preferiti.length) {
        favGrid.innerHTML = '<p class="empty-state">Nessun libro aggiunto ai preferiti.</p>';
        return;
    }

    preferiti.forEach((libro) => {
        const card = `
            <article class="favorite-card">
                <div class="fav-thumb">
                    <img src="${escapeHtml(libro.imgStoria || 'img/story-1.jpg')}" alt="${escapeHtml(libro.titolo)}" onerror="this.src='img/story-1.jpg'"/>
                    <span class="fav-genre">${escapeHtml(libro.genere || 'Generale')}</span>
                </div>
                <div class="fav-body">
                    <h3 class="fav-title">${escapeHtml(libro.titolo)}</h3>
                    <p class="fav-author">di ${escapeHtml(libro.autore || 'Autore sconosciuto')}</p>
                    <p class="fav-desc">${escapeHtml(libro.descrizione || 'Nessuna descrizione disponibile.')}</p>
                    <a href="story.html?id=${libro.id}" class="btn-read-fav">Leggi ?</a>
                </div>
            </article>
        `;
        favGrid.insertAdjacentHTML('beforeend', card);
    });
}

async function caricaProfiloPersonale() {
    const currentUser = getCurrentUser();
    if (!currentUser?.email) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(`/api/utenti/email/${encodeURIComponent(currentUser.email)}`);
        if (!res.ok) throw new Error('Profilo non trovato');

        const utente = await res.json();
        document.title = 'Plotty – Il Mio Profilo';
        document.querySelector('.profile-handle').textContent = `@${utente.username}`;
        document.querySelector('.profile-name').innerHTML = `${utente.nome} <em>${utente.cognome}</em>`;

        const stats = document.querySelectorAll('.profile-stats .stat-num');
        if (stats.length >= 3) {
            stats[0].textContent = utente.storie.length;
            stats[1].textContent = utente.followersCount || 0;
            stats[2].textContent = utente.followingCount || 0;
        }

        document.querySelector('.section-count').textContent = `${utente.storie.length} racconti`;

        const grid = document.querySelector('.story-grid');
        grid.innerHTML = '';

        if (!utente.storie.length) {
            grid.innerHTML = '<p>Nessuna storia pubblicata. <a href="writeStory.html">Scrivi la tua prima storia!</a></p>';
        } else {
            utente.storie.forEach((storia) => {
                const card = `
                    <article class="story-card">
                        <div class="card-thumb">
                            <div class="card-thumb-img" style="background-image:url('${escapeHtml(storia.imgStoria || 'img/story-1.jpg')}');"></div>
                            <span class="card-genre">${escapeHtml(storia.genere || 'Generale')}</span>
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${escapeHtml(storia.titolo)}</h3>
                            <p class="card-author">di ${escapeHtml(utente.username)}</p>
                            <p class="card-desc">${escapeHtml(storia.descrizione || 'Nessuna descrizione disponibile.')}</p>
                            <div class="card-footer">
                                <a href="story.html?id=${storia.id}" class="btn-read">Leggi ?</a>
                                <div class="card-actions-personal">
                                    <a href="writeStory.html?id=${storia.id}" class="btn-edit">Modifica</a>
                                </div>
                            </div>
                        </div>
                    </article>
                `;
                grid.insertAdjacentHTML('beforeend', card);
            });
        }

        const resFav = await fetch(`/api/utenti/${utente.id}/preferiti`);
        if (resFav.ok) {
            const dataFav = await resFav.json();
            renderFavorites(dataFav.preferiti || []);
        } else {
            renderFavorites([]);
        }
    } catch (err) {
        console.error('Errore nel caricamento del profilo personale:', err);
        alert('Errore nel caricamento del profilo!');
        window.location.href = 'home.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    bindSearch();
    caricaProfiloPersonale();
});
