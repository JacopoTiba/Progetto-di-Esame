async function caricaStorie() {
    try {
        const res = await fetch('/api/storie');
        const data = await res.json();
        const grid = document.getElementsByClassName('story-grid')[0];
        grid.innerHTML = '';

        if (data.storie.length === 0) {
            grid.innerHTML = '<p>Nessuna storia trovata.</p>';
            return;
        }

        data.storie.forEach(storia => {
            const autoreHtml = storia.autore === 'Autore sconosciuto'
                ? `<p class="card-author" style="color:var(--rose-muted);">
                       ⚠️ Autore non trovato (id: ${storia.idUtente})
                   </p>`
                : `<a href="user.html?id=${storia.idUtente}">
                       <p class="card-author">by ${storia.autore}</p>
                   </a>`;

            const card = `
                <article class="story-card">
                    <div class="card-image">
                        <img src="${storia.imgStoria}" alt="${storia.titolo}" 
                             onerror="this.src='img/story-1.jpg'" />
                        <div class="card-badge">${storia.genere}</div>
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${storia.titolo}</h3>
                        ${autoreHtml}
                        <p class="card-desc">${storia.descrizione || 'Nessuna descrizione disponibile.'}</p>
                        <div class="card-meta">
                            <span class="meta-item">${storia.capitoli} capitoli</span>
                            <span class="meta-item">♥ ${storia.nLike}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-read" data-id="${storia.id}">Read</button>
                        </div>
                    </div>
                </article>
            `;
            grid.innerHTML += card;
        });

    } catch (err) {
        console.error('Errore nel caricamento delle storie:', err);
    }
}

document.addEventListener('DOMContentLoaded', caricaStorie);