let allStorie = [];
let isSearching = false;

async function caricaStorie() {
  try {
    const res = await fetch("/api/storie");
    const data = await res.json();
    allStorie = data.storie || [];
    
    visualizzaStorie(allStorie.slice(0, 6));
  } catch (err) {
    console.error("Errore nel caricamento delle storie:", err);
  }
}

function visualizzaStorie(storie) {
  const grid = document.getElementsByClassName("story-grid")[0];
  grid.innerHTML = "";

  if (storie.length === 0) {
    grid.innerHTML = "<p>Nessuna storia trovata.</p>";
    return;
  }

  storie.forEach((storia) => {
    const autoreHtml =
      storia.autore === "Autore sconosciuto"
        ? `<p class="card-author card-author--error">
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
                      <p class="card-desc">${storia.descrizione || "Nessuna descrizione disponibile."}</p>
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

  // Aggiungi event listener ai bottoni Read
  aggiungiEventListenerRead();
}

function aggiungiEventListenerRead() {
  document.querySelectorAll(".btn-read").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const card = btn.closest(".story-card");

      const titolo = card.querySelector(".card-title").textContent;
      const genere = card.querySelector(".card-badge").textContent;
      const img = card.querySelector(".card-image img").src;
      const desc = card.querySelector(".card-desc").textContent;
      const autore = card.querySelector(".card-author").textContent;
      const capitoli = card.querySelector(".meta-item").textContent;

      document.getElementById("modalTitle").textContent = titolo;
      document.getElementById("modalBadge").textContent = genere;
      document.getElementById("modalCover").src = img;
      document.getElementById("modalDesc").textContent = desc;
      document.getElementById("modalAuthor").textContent = autore;
      document.getElementById("modalChapters").textContent = capitoli;

      document.querySelector(".btn-full-story").href = `story.html?id=${id}`;

      const modal = document.getElementById("storyModal");
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });
}

// Filtro per genere (tag buttons)
function filterByGenre(genre) {
  const tags = document.querySelectorAll(".tag");
  tags.forEach(tag => tag.classList.remove("active"));
  
  let filtered = allStorie;
  if (genre !== "All") {
    filtered = allStorie.filter(s => s.genere === genre);
  }
  
  // Se in ricerca, mostra tutti i filtrati; altrimenti mostra solo i primi 6
  const toShow = isSearching ? filtered : filtered.slice(0, 6);
  visualizzaStorie(toShow);
  
  // Marca il tag come attivo
  event.target.classList.add("active");
}

// Ricerca per titolo e autore
function handleSearch(query) {
  if (!query.trim()) {
    isSearching = false;
    visualizzaStorie(allStorie.slice(0, 6));
  } else {
    isSearching = true;
    const searched = allStorie.filter(s => 
      s.titolo.toLowerCase().includes(query.toLowerCase()) ||
      s.autore.toLowerCase().includes(query.toLowerCase())
    );
    visualizzaStorie(searched);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  caricaStorie();
  
  // Event listener per i tag di genere
  const tags = document.querySelectorAll(".tag");
  tags.forEach(tag => {
    tag.addEventListener("click", () => {
      const genre = tag.textContent.trim();
      filterByGenre(genre);
    });
  });
  
  // Event listener per la barra di ricerca
  const searchForm = document.querySelector(".search-form-right");
  const searchInput = document.querySelector(".search-input");
  
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSearch(searchInput.value);
    });
    
    searchInput.addEventListener("input", (e) => {
      handleSearch(e.target.value);
    });
  }
});
