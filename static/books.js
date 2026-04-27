let allBooks = [];
let currentQuery = "";
let currentGenre = "All";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("q") || "").trim();
}

function renderBooks(list) {
  const grid = document.getElementById("booksGrid");
  const count = document.getElementById("booksCount");
  if (!grid || !count) return;

  count.textContent = `${list.length} risultat${list.length === 1 ? "o" : "i"}`;
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<p>Nessun libro trovato.</p>";
    return;
  }

  list.forEach((storia) => {
    const card = `
      <article class="story-card">
        <div class="card-image">
          <img src="${escapeHtml(storia.imgStoria || "img/story-1.jpg")}" alt="${escapeHtml(storia.titolo)}" onerror="this.src='img/story-1.jpg'" />
          <div class="card-badge">${escapeHtml(storia.genere || "Generale")}</div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(storia.titolo)}</h3>
          <a href="user.html?id=${storia.idUtente}"><p class="card-author">by ${escapeHtml(storia.autore || "Autore")}</p></a>
          <p class="card-desc">${escapeHtml(storia.descrizione || "Nessuna descrizione disponibile.")}</p>
          <div class="card-meta">
            <span class="meta-item">${escapeHtml(storia.capitoli)} capitoli</span>
            <span class="meta-item">♥ ${escapeHtml(storia.nLike)}</span>
          </div>
          <div class="card-actions">
            <a href="story.html?id=${storia.id}" class="btn-read">Read</a>
          </div>
        </div>
      </article>
    `;
    grid.insertAdjacentHTML("beforeend", card);
  });
}

function applyFilters() {
  let list = allBooks;

  if (currentQuery) {
    const q = currentQuery.toLowerCase();
    list = list.filter((s) =>
      (s.titolo || "").toLowerCase().includes(q) ||
      (s.autore || "").toLowerCase().includes(q) ||
      (s.descrizione || "").toLowerCase().includes(q)
    );
  }

  if (currentGenre !== "All") {
    list = list.filter((s) => (s.genere || "").toLowerCase() === currentGenre.toLowerCase());
  }

  renderBooks(list);
}

async function loadBooks() {
  try {
    const res = await fetch("/api/storie");
    if (!res.ok) throw new Error("Errore API");
    const data = await res.json();
    allBooks = data.storie || [];
    applyFilters();
  } catch (err) {
    console.error("Errore caricamento libri:", err);
    renderBooks([]);
  }
}

function bindSearch() {
  const form = document.getElementById("booksSearchForm");
  const input = document.getElementById("booksSearchInput");
  if (!form || !input) return;

  input.value = currentQuery;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    currentQuery = (input.value || "").trim();
    const params = new URLSearchParams(window.location.search);
    if (currentQuery) params.set("q", currentQuery);
    else params.delete("q");
    history.replaceState(null, "", `books.html${params.toString() ? "?" + params.toString() : ""}`);
    applyFilters();
  });

  input.addEventListener("input", () => {
    currentQuery = (input.value || "").trim();
    applyFilters();
  });
}

function bindTags() {
  document.querySelectorAll("#booksTags .tag").forEach((tag) => {
    tag.addEventListener("click", () => {
      document.querySelectorAll("#booksTags .tag").forEach((t) => t.classList.remove("active"));
      tag.classList.add("active");
      currentGenre = tag.getAttribute("data-genre") || "All";
      applyFilters();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  currentQuery = getQueryFromUrl();
  bindSearch();
  bindTags();
  loadBooks();
});
