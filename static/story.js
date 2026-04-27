let currentStory = null;

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

function renderReviews(items) {
    const list = document.getElementById('reviewsList');
    const count = document.getElementById('commentCount');
    if (!list || !count) return;

    count.textContent = items.length;
    list.innerHTML = '';

    if (!items.length) {
        list.innerHTML = '<p class="reviews-empty">Nessuna recensione ancora. Scrivi la prima!</p>';
        return;
    }

    items.forEach((r) => {
        const stars = '?'.repeat(Math.max(1, Math.min(5, Number(r.voto || 0))));
        const card = `
            <article class="review-item">
                <div class="review-head">
                    <strong>${escapeHtml(r.username || 'Utente')}</strong>
                    <span class="review-stars">${stars}</span>
                </div>
                <p>${escapeHtml(r.testo || '')}</p>
            </article>
        `;
        list.insertAdjacentHTML('beforeend', card);
    });
}

async function loadReviews(storyId) {
    try {
        const res = await fetch(`/api/storie/${storyId}/recensioni`);
        if (!res.ok) throw new Error('Errore recensioni');
        const data = await res.json();
        renderReviews(data.recensioni || []);
    } catch (err) {
        console.error(err);
        renderReviews([]);
    }
}

function bindReviewForm(storyId) {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user?.email) {
            alert('Devi essere loggato per recensire.');
            return;
        }

        const voto = Number(document.getElementById('reviewRating')?.value || 0);
        const testo = (document.getElementById('reviewText')?.value || '').trim();

        const res = await fetch(`/api/storie/${storyId}/recensioni`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, voto, testo }),
        });

        if (!res.ok) {
            alert('Errore nel salvataggio della recensione.');
            return;
        }

        form.reset();
        loadReviews(storyId);
    });
}

function bindLike(storyId) {
    const btn = document.getElementById('btnLike');
    const count = document.getElementById('likeCount');
    if (!btn || !count) return;

    btn.addEventListener('click', async () => {
        const user = getCurrentUser();
        if (!user?.email) {
            alert('Devi essere loggato per mettere like.');
            return;
        }

        const res = await fetch(`/api/storie/${storyId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
        });

        if (!res.ok) {
            alert('Errore nel like.');
            return;
        }

        const data = await res.json();
        count.textContent = data.nLike;
        btn.classList.toggle('active', !!data.liked);
    });
}

function bindBookmark(storyId) {
    const btn = document.getElementById('btnBookmark');
    if (!btn) return;

    const setBookmarkUi = (isFavorite) => {
        btn.classList.toggle('active', !!isFavorite);
        btn.setAttribute('data-tip', isFavorite ? 'Salvato' : 'Salva');
    };

    const loadInitialBookmarkState = async () => {
        const user = getCurrentUser();
        if (!user?.email) return;

        try {
            const meRes = await fetch(`/api/utenti/email/${encodeURIComponent(user.email)}`);
            if (!meRes.ok) return;
            const me = await meRes.json();

            const favRes = await fetch(`/api/utenti/${me.id}/preferiti`);
            if (!favRes.ok) return;
            const favData = await favRes.json();
            const preferiti = favData.preferiti || [];
            const isFavorite = preferiti.some((s) => s.id === storyId);
            setBookmarkUi(isFavorite);
        } catch (err) {
            console.error('Errore caricamento stato preferito:', err);
        }
    };

    loadInitialBookmarkState();

    btn.addEventListener('click', async () => {
        const user = getCurrentUser();
        if (!user?.email) {
            alert('Devi essere loggato per salvare nei preferiti.');
            return;
        }

        const res = await fetch(`/api/storie/${storyId}/preferiti`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
        });

        if (!res.ok) {
            alert('Errore nel salvataggio preferito.');
            return;
        }

        const data = await res.json();
        setBookmarkUi(!!data.isFavorite);
        alert(data.isFavorite ? 'Aggiunto ai preferiti.' : 'Rimosso dai preferiti.');
    });
}

function bindCommentScroll() {
    const btn = document.getElementById('btnComment');
    const section = document.getElementById('reviewsSection');
    if (!btn || !section) return;

    btn.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

async function caricaStoria() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('Storia non trovata!');
        window.location.href = 'home.html';
        return;
    }

    try {
        const res = await fetch(`/api/storie/${id}`);
        if (!res.ok) throw new Error('Storia non trovata');

        const storia = await res.json();
        currentStory = storia;

        document.title = `Plotty � ${storia.titolo}`;
        document.getElementById('heroCover').src = storia.imgStoria || 'img/story-1.jpg';
        document.getElementById('heroTitle').textContent = storia.titolo;
        document.getElementById('heroGenre').textContent = storia.genere || 'Generale';

        const autoreEl = document.getElementById('heroAuthor');
        if (storia.autore === 'Autore sconosciuto') {
            autoreEl.textContent = 'Autore non trovato';
            autoreEl.removeAttribute('href');
        } else {
            autoreEl.textContent = storia.autore;
            autoreEl.href = `user.html?id=${storia.idUtente}`;
        }

        const words = (storia.contenuto || '').split(/\s+/).filter(Boolean).length;
        document.getElementById('metaWords').textContent = `${words} parole`;
        document.getElementById('metaReadTime').textContent = `${Math.max(1, Math.ceil(words / 200))} min`;
        document.getElementById('metaViews').textContent = storia.nLike || 0;
        document.getElementById('likeCount').textContent = storia.nLike || 0;

        document.getElementById('metaRating').textContent = storia.ratingMedio ? String(storia.ratingMedio) : '�';
        document.getElementById('storySummary').textContent = storia.descrizione || 'Nessuna sinossi disponibile.';
        document.getElementById('storyEndTitle').textContent = storia.titolo;

        const storyBody = document.getElementById('storyBody');
        storyBody.innerHTML = '';

        const blocks = (storia.contenuto || '').split(/\n\n+/);
        blocks.forEach((block, i) => {
            const trimmed = block.trim();
            if (!trimmed) return;
            if (trimmed === '[***]') {
                const sep = document.createElement('p');
                sep.className = 'scene-break';
                sep.textContent = '? ? ?';
                storyBody.appendChild(sep);
            } else {
                const p = document.createElement('p');
                p.textContent = trimmed;
                p.style.animationDelay = `${i * 0.04}s`;
                storyBody.appendChild(p);
            }
        });

        document.getElementById('storyEnd').style.display = 'flex';

        bindLike(id);
        bindBookmark(id);
        bindCommentScroll();
        bindReviewForm(id);
        loadReviews(id);
    } catch (err) {
        console.error('Errore nel caricamento della storia:', err);
        alert('Errore nel caricamento della storia!');
        window.location.href = 'home.html';
    }
}

document.addEventListener('DOMContentLoaded', caricaStoria);
