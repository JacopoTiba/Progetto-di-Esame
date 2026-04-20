async function caricaStoria() {
    // Legge l'id dall'URL: story.html?id=...
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert('Storia non trovata!');
        window.location.href = 'home.html';
        return;
    }

    try {
        const res = await fetch(`/api/storie/${id}`);
        
        if (!res.ok) {
            alert('Storia non trovata!');
            window.location.href = 'home.html';
            return;
        }

        const storia = await res.json();

        // Titolo pagina
        document.title = `Plotty – ${storia.titolo}`;

        // Hero
        document.getElementById('heroCover').src = storia.imgStoria || 'https://res.cloudinary.com/drwzjt2oi/image/upload/v1776681940/plotty/layout/story-1.jpg';
        document.getElementById('heroTitle').textContent = storia.titolo;
        document.getElementById('heroGenre').textContent = storia.genere;

        // Autore
        const autoreEl = document.getElementById('heroAuthor');
        if (storia.autore === 'Autore sconosciuto') {
            autoreEl.textContent = '⚠️ Autore non trovato';
            autoreEl.removeAttribute('href');
        } else {
            autoreEl.textContent = storia.autore;
            autoreEl.href = `user.html?id=${storia.idUtente}`;
        }

        // Meta bar
        document.getElementById('metaWords').textContent = `${storia.contenuto.split(' ').length} parole`;
        document.getElementById('metaReadTime').textContent = `${Math.ceil(storia.contenuto.split(' ').length / 200)} min`;
        document.getElementById('metaViews').textContent = storia.nLike;

        // Stelle rating (statico per ora)
        document.getElementById('metaRating').textContent = '–';

        // Descrizione come sinossi
        document.getElementById('storySummary').textContent = storia.descrizione || storia.contenuto.substring(0, 150) + '...';

        // Fine storia
        document.getElementById('storyEndTitle').textContent = storia.titolo;

        // Corpo testo
        const storyBody = document.getElementById('storyBody');
        storyBody.innerHTML = '';
        const blocks = storia.contenuto.split(/\n\n+/);
        blocks.forEach((block, i) => {
            const trimmed = block.trim();
            if (!trimmed) return;
            if (trimmed === '[***]') {
                const sep = document.createElement('p');
                sep.className = 'scene-break';
                sep.textContent = '✦ ✦ ✦';
                storyBody.appendChild(sep);
            } else {
                const p = document.createElement('p');
                p.textContent = trimmed;
                p.style.animationDelay = `${i * 0.04}s`;
                storyBody.appendChild(p);
            }
        });

        // Mostra fine storia
        document.getElementById('storyEnd').style.display = 'flex';

        // Like count
        document.getElementById('likeCount').textContent = storia.nLike;

    } catch (err) {
        console.error('Errore nel caricamento della storia:', err);
        alert('Errore nel caricamento della storia!');
        window.location.href = 'home.html';
    }
}

document.addEventListener('DOMContentLoaded', caricaStoria);