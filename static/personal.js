async function caricaProfilo() {
  // Legge i dati dal cookie
  function getCookie(name) {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="));
    if (!match) return null;
    try {
      return JSON.parse(
        decodeURIComponent(match.split("=").slice(1).join("=")),
      );
    } catch {
      return null;
    }
  }

  const utente = getCookie("utente");
  if (!utente || !utente.id) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`/api/utenti/${utente.id}`);
    if (!res.ok) {
      window.location.href = "index.html";
      return;
    }

    const dati = await res.json();

    // Popola profilo
    document.title = `${dati.username} – Plotty`;
    document.querySelector(".profile-handle").textContent = `@${dati.username}`;
    document.querySelector(".profile-name").innerHTML =
      `${dati.nome} <em>${dati.cognome}</em>`;

    // Stats
    const statNums = document.querySelectorAll(".stat-num");
    statNums[0].textContent = dati.storie.length; // Storie
    statNums[1].textContent = 0; // Follower (da implementare)
    statNums[2].textContent = 0; // Seguiti (da implementare)

    // Contatore sezione
    document.querySelector(".section-count").textContent =
      `${dati.storie.length} racconti`;

    // Griglia storie
    const grid = document.querySelector(".story-grid");
    grid.innerHTML = "";

    if (dati.storie.length === 0) {
      grid.innerHTML = "<p>Non hai ancora pubblicato nessuna storia.</p>";
      return;
    }

    dati.storie.forEach((storia) => {
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
                        <p class="card-author">di ${dati.username}</p>
                        <p class="card-desc">${storia.descrizione || "Nessuna descrizione disponibile."}</p>
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
    console.error("Errore nel caricamento del profilo:", err);
  }
}

document.addEventListener("DOMContentLoaded", caricaProfilo);
