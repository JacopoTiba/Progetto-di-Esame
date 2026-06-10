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

async function deleteStory(storyId, userEmail) {
    const res = await fetch(`/api/storie/${storyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
    });

    if (!res.ok) {
        let message = 'Eliminazione non riuscita.';
        try {
            const data = await res.json();
            if (data?.message) message = data.message;
        } catch {
            // Keep default error message when response body is not JSON.
        }
        throw new Error(message);
    }
}

function bindDeleteStory(currentUser, storieArray, grid) {
    if (!grid) return;

    grid.addEventListener('click', async (event) => {
        const button = event.target.closest('.btn-delete');
        if (!button) return;

        const card = button.closest('.story-card');
        const storyId = button.dataset.storyId;
        if (!card || !storyId) return;

        const ok = window.confirm('Sei sicuro di voler eliminare questa storia?');
        if (!ok) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Eliminazione...';

        try {
            await deleteStory(storyId, currentUser.email);
            card.remove();
        } catch (err) {
            alert(err.message || 'Errore durante l\'eliminazione della storia.');
            button.disabled = false;
            button.textContent = originalText;
        }
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
            <article class="story-card" onclick="window.location.href='story.html?id=${libro.id}'">
                <div class="card-thumb">
                    <div class="card-thumb-img" style="background-image:url('${escapeHtml(libro.imgStoria || 'img/story-1.jpg')}');"></div>
                    <span class="card-genre">${escapeHtml(libro.genere || 'Generale')}</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${escapeHtml(libro.titolo)}</h3>
                    <p class="card-author">di ${escapeHtml(libro.autore || 'Autore sconosciuto')}</p>
                    <p class="card-desc">${escapeHtml(libro.descrizione || 'Nessuna descrizione disponibile.')}</p>
                    <div class="card-footer">
                        <a href="story.html?id=${libro.id}" class="btn-read" onclick="event.stopPropagation()">Leggi \u2192</a>
                    </div>
                </div>
            </article>
        `;
        favGrid.insertAdjacentHTML('beforeend', card);
    });
}

function renderStoryCard(storia, username, isDraft = false) {
    const draftBadge = isDraft
        ? `<span class="card-draft-badge">📝 Bozza</span>`
        : '';
        
    const tagsHtml = Array.isArray(storia.tags) && storia.tags.length > 0
        ? `<div class="card-tags">${storia.tags.map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}</div>`
        : '';

    return `
        <article class="story-card" onclick="window.location.href='story.html?id=${storia.id}'">
            <div class="card-thumb">
                <div class="card-thumb-img" style="background-image:url('${escapeHtml(storia.imgStoria || 'img/story-1.jpg')}');"></div>
                <span class="card-genre">${escapeHtml(storia.genere || 'Generale')}</span>
                ${draftBadge}
            </div>
            <div class="card-body">
                <h3 class="card-title">${escapeHtml(storia.titolo)}</h3>
                <p class="card-author">di ${escapeHtml(username)}</p>
                <p class="card-desc">${escapeHtml(storia.descrizione || 'Nessuna descrizione disponibile.')}</p>
                ${tagsHtml}
                <div class="card-footer">
                    <a href="editStory.html?id=${storia.id}" class="btn-read" onclick="event.stopPropagation()">Modifica →</a>
                    <div class="card-actions-personal">
                        <button class="btn-delete" data-story-id="${storia.id}" onclick="event.stopPropagation()">Elimina</button>
                    </div>
                </div>
            </div>
        </article>
    `;
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

        // Aggiorna bio
        const bioEl = document.querySelector('.profile-bio');
        if (bioEl) {
            bioEl.textContent = utente.bio || 'Aggiungi una bio al tuo profilo...';
        }

        // Aggiorna avatar
        const avatarImg = document.querySelector('.profile-avatar img');
        if (avatarImg && utente.avatar) {
            avatarImg.src = utente.avatar;
        }

        // Carica TUTTE le storie (incluse le bozze) tramite la rotta privata
        const resAll = await fetch(`/api/storie/mie?email=${encodeURIComponent(currentUser.email)}`);
        const allStorieData = resAll.ok ? await resAll.json() : { storie: [] };
        const tutteLeStorie = allStorieData.storie || [];

        const storiePublicate = tutteLeStorie.filter(s => s.status === 'published');
        const bozze = tutteLeStorie.filter(s => s.status === 'draft');

        // Aggiorna le stat nel profilo
        const stats = document.querySelectorAll('.profile-stats .stat-num');
        if (stats.length >= 3) {
            stats[0].textContent = storiePublicate.length;
            stats[1].textContent = utente.followersCount || 0;
            stats[2].textContent = utente.followingCount || 0;
        }

        document.querySelector('.section-count').textContent = `${storiePublicate.length} racconti`;

        // ── Storie pubblicate ──
        const grid = document.querySelector('.story-grid');
        grid.innerHTML = '';
        if (!storiePublicate.length) {
            grid.innerHTML = '<p>Nessuna storia pubblicata. <a href="writeStory.html">Scrivi la tua prima storia!</a></p>';
        } else {
            storiePublicate.forEach(storia => {
                grid.insertAdjacentHTML('beforeend', renderStoryCard(storia, utente.username, false));
            });
            bindDeleteStory(currentUser, tutteLeStorie, grid);
        }

        // ── Bozze ──
        const draftsSection = document.getElementById('draftsSection');
        const draftsGrid = document.getElementById('draftsGrid');
        const draftsCount = document.getElementById('draftsCount');

        if (bozze.length > 0) {
            draftsSection.style.display = '';
            draftsCount.textContent = `${bozze.length} bozz${bozze.length === 1 ? 'a' : 'e'}`;
            draftsGrid.innerHTML = '';
            bozze.forEach(storia => {
                draftsGrid.insertAdjacentHTML('beforeend', renderStoryCard(storia, utente.username, true));
            });
            bindDeleteStory(currentUser, tutteLeStorie, draftsGrid);
        } else {
            draftsSection.style.display = 'none';
        }

        // ── Preferiti ──
        const resFav = await fetch(`/api/utenti/${utente.id}/preferiti`);
        if (resFav.ok) {
            const dataFav = await resFav.json();
            renderFavorites(dataFav.preferiti || []);
        } else {
            renderFavorites([]);
        }

        // ── Aggancia il bottone Modifica Profilo ──
        bindEditProfile(utente, currentUser.email);

    } catch (err) {
        console.error('Errore nel caricamento del profilo personale:', err);
        alert('Errore nel caricamento del profilo!');
        window.location.href = 'home.html';
    }
}

function bindEditProfile(utente, email) {
    const editBtn = document.getElementById('btnEditProfile');
    if (!editBtn) return;

    editBtn.addEventListener('click', () => openEditModal(utente, email));
}

function openEditModal(utente, email) {
    // Rimuovi un eventuale modal precedente
    const existing = document.getElementById('editProfileModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'editProfileModal';
    modal.className = 'edit-modal-overlay';
    modal.innerHTML = `
        <div class="edit-modal">
            <div class="edit-modal-header">
                <h2 class="edit-modal-title">Modifica Profilo</h2>
                <button class="edit-modal-close" id="closeEditModal" aria-label="Chiudi">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="edit-modal-body">
                <!-- Avatar -->
                <div class="edit-avatar-section">
                    <div class="edit-avatar-preview" id="editAvatarPreview">
                        <img src="${escapeHtml(utente.avatar || 'https://placehold.co/82x82/c9a96e/fdf9f3?text=\u2726')}" alt="Avatar" id="editAvatarImg" />
                        <div class="edit-avatar-overlay">
                            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                            <span>Cambia foto</span>
                        </div>
                    </div>
                    <input type="file" id="editAvatarInput" accept="image/*" style="display:none" />
                    <p class="edit-avatar-hint">Clicca sull'immagine per cambiare la foto profilo</p>
                </div>
                <!-- Bio -->
                <div class="edit-field">
                    <label class="edit-label" for="editBioInput">La tua bio</label>
                    <textarea id="editBioInput" class="edit-textarea" maxlength="300" placeholder="Racconta qualcosa di te...">${escapeHtml(utente.bio || '')}</textarea>
                    <span class="edit-char-count"><span id="bioCharCount">${(utente.bio || '').length}</span>/300</span>
                </div>
            </div>
            <div class="edit-modal-footer">
                <button class="btn-secondary" id="cancelEditModal">Annulla</button>
                <button class="btn-primary" id="saveEditModal">Salva modifiche</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Anima l'apertura
    requestAnimationFrame(() => modal.classList.add('open'));

    // Gestione chiusura
    const closeModal = () => {
        modal.classList.remove('open');
        setTimeout(() => modal.remove(), 300);
    };
    document.getElementById('closeEditModal').addEventListener('click', closeModal);
    document.getElementById('cancelEditModal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Gestione upload avatar
    let newAvatarBase64 = null;
    const avatarPreview = document.getElementById('editAvatarPreview');
    const avatarInput = document.getElementById('editAvatarInput');
    const avatarImg = document.getElementById('editAvatarImg');

    avatarPreview.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            newAvatarBase64 = ev.target.result;
            avatarImg.src = newAvatarBase64;
        };
        reader.readAsDataURL(file);
    });

    // Contatore caratteri bio
    const bioInput = document.getElementById('editBioInput');
    const bioCharCount = document.getElementById('bioCharCount');
    bioInput.addEventListener('input', () => {
        bioCharCount.textContent = bioInput.value.length;
    });

    // Salva
    document.getElementById('saveEditModal').addEventListener('click', async () => {
        const saveBtn = document.getElementById('saveEditModal');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Salvataggio...';

        const payload = {
            email,
            bio: bioInput.value.trim(),
        };
        if (newAvatarBase64) {
            payload.avatarBase64 = newAvatarBase64;
        }

        try {
            const res = await fetch(`/api/utenti/${utente.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Errore nel salvataggio');
            }
            const data = await res.json();
            const updated = data.user;

            // Aggiorna UI immediatamente
            const bioEl = document.querySelector('.profile-bio');
            if (bioEl) bioEl.textContent = updated.bio || 'Aggiungi una bio al tuo profilo...';

            const mainAvatarImg = document.querySelector('.profile-avatar img');
            if (mainAvatarImg && updated.avatar) mainAvatarImg.src = updated.avatar;

            // Aggiorna avatar nella navbar immediatamente
            const navAvatar = document.getElementById('navAvatar');
            if (navAvatar && updated.avatar) {
                let img = navAvatar.querySelector('.nav-avatar-img');
                if (!img) {
                    const svg = navAvatar.querySelector('.avatar-fallback-icon');
                    if (svg) svg.remove();
                    img = document.createElement('img');
                    img.className = 'nav-avatar-img';
                    img.alt = 'Avatar';
                    navAvatar.appendChild(img);
                }
                img.src = updated.avatar;
            }

            closeModal();

        } catch (err) {
            alert(err.message || 'Errore durante il salvataggio.');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Salva modifiche';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindSearch();
    caricaProfiloPersonale();
});