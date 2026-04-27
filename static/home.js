let allStorie = [];
let currentFilter = "All";

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

function renderModalReviews(reviews) {
    const reviewsList = document.getElementById('modalReviewsList');
    const reviewsCount = document.getElementById('modalReviewsCount');
    const ratingValue = document.getElementById('modalRating');
    if (!reviewsList || !reviewsCount || !ratingValue) return;

    reviewsList.innerHTML = '';
    reviewsCount.textContent = `${reviews.length} review${reviews.length === 1 ? '' : 's'}`;

    if (!reviews.length) {
        ratingValue.textContent = '-';
        reviewsList.innerHTML = '<p class="review-empty">No reviews yet.</p>';
        return;
    }

    const avg = reviews.reduce((acc, r) => acc + Number(r.voto || 0), 0) / reviews.length;
    ratingValue.textContent = avg.toFixed(1);

    reviews.forEach((review) => {
        const fullStars = Math.max(0, Math.min(5, Number(review.voto || 0)));
        const stars = `${'★'.repeat(fullStars)}${'☆'.repeat(5 - fullStars)}`;

        const card = `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-user">
                        <p class="review-name">${escapeHtml(review.username || 'Utente')}</p>
                    </div>
                    <div class="review-rating">${stars}</div>
                </div>
                <p class="review-text">${escapeHtml(review.testo || '')}</p>
            </div>
        `;

        reviewsList.insertAdjacentHTML('beforeend', card);
    });
}

async function loadModalReviews(storyId) {
    try {
        const res = await fetch(`/api/storie/${storyId}/recensioni`);
        if (!res.ok) throw new Error('Errore caricamento recensioni');
        const data = await res.json();
        renderModalReviews(data.recensioni || []);
    } catch (err) {
        console.error('Errore recensioni modal:', err);
        renderModalReviews([]);
    }
}

function renderStories(storie) {
    const grid = document.querySelector('.story-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!storie.length) {
        grid.innerHTML = '<p>Nessuna storia trovata.</p>';
        return;
    }

    storie.forEach((storia) => {
        const autoreHtml =
            storia.autore === 'Autore sconosciuto'
                ? `<p class="card-author card-author--error">Autore non trovato</p>`
                : `<a href="user.html?id=${storia.idUtente}"><p class="card-author">by ${escapeHtml(storia.autore)}</p></a>`;

        const card = `
            <article class="story-card">
                <div class="card-image">
                    <img src="${escapeHtml(storia.imgStoria || 'img/story-1.jpg')}" alt="${escapeHtml(storia.titolo)}" onerror="this.src='img/story-1.jpg'" />
                    <div class="card-badge">${escapeHtml(storia.genere || 'Generale')}</div>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${escapeHtml(storia.titolo)}</h3>
                    ${autoreHtml}
                    <p class="card-desc">${escapeHtml(storia.descrizione || 'Nessuna descrizione disponibile.')}</p>
                    <div class="card-meta">
                        <span class="meta-item">${escapeHtml(storia.capitoli)} capitoli</span>
                        <span class="meta-item">? ${escapeHtml(storia.nLike)}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn-read" data-id="${storia.id}">Read</button>
                    </div>
                </div>
            </article>
        `;

        grid.insertAdjacentHTML('beforeend', card);
    });

    bindReadButtons();
}

function bindReadButtons() {
    document.querySelectorAll('.btn-read').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const card = btn.closest('.story-card');
            if (!card) return;

            const titolo = card.querySelector('.card-title')?.textContent || '';
            const genere = card.querySelector('.card-badge')?.textContent || '';
            const img = card.querySelector('.card-image img')?.src || 'img/story-1.jpg';
            const desc = card.querySelector('.card-desc')?.textContent || '';
            const autore = card.querySelector('.card-author')?.textContent || '';
            const capitoli = card.querySelector('.meta-item')?.textContent || '';

            const modal = document.getElementById('storyModal');
            if (!modal) {
                window.location.href = `story.html?id=${id}`;
                return;
            }

            document.getElementById('modalTitle').textContent = titolo;
            document.getElementById('modalBadge').textContent = genere;
            document.getElementById('modalCover').src = img;
            document.getElementById('modalDesc').textContent = desc;
            document.getElementById('modalAuthor').textContent = autore;
            document.getElementById('modalChapters').textContent = capitoli;
            document.querySelector('.btn-full-story').href = `story.html?id=${id}`;

            loadModalReviews(id);

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
}

function applyFilters() {
    let filtered = allStorie;

    if (currentFilter !== 'All') {
        filtered = filtered.filter((s) => (s.genere || '').toLowerCase() === currentFilter.toLowerCase());
    }

    const toShow = currentFilter === 'All' ? filtered.slice(0, 6) : filtered;
    renderStories(toShow);
}

async function caricaStorie() {
    try {
        const res = await fetch('/api/storie');
        if (!res.ok) throw new Error('Errore API storie');
        const data = await res.json();
        allStorie = data.storie || [];
        applyFilters();
    } catch (err) {
        console.error('Errore nel caricamento delle storie:', err);
        renderStories([]);
    }
}

function bindGenreFilters() {
    document.querySelectorAll('.tag').forEach((tag) => {
        tag.addEventListener('click', () => {
            document.querySelectorAll('.tag').forEach((t) => t.classList.remove('active'));
            tag.classList.add('active');
            currentFilter = (tag.textContent || 'All').trim();
            applyFilters();
        });
    });
}

function bindSearchToBooksPage() {
    const searchForm = document.querySelector('.search-form-right');
    const searchInput = document.querySelector('.search-input');
    if (!searchForm || !searchInput) return;

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = (searchInput.value || '').trim();
        const url = query ? `books.html?q=${encodeURIComponent(query)}` : 'books.html';
        window.location.href = url;
    });
}

function bindModalClose() {
    const modal = document.getElementById('storyModal');
    const closeBtn = document.querySelector('.modal-close');
    if (!modal || !closeBtn) return;

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    getCurrentUser();
    bindSearchToBooksPage();
    bindGenreFilters();
    bindModalClose();
    caricaStorie();
});
