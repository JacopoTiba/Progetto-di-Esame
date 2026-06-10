/**
 * chat.js — Chat privata DM di Plotty
 *
 * Funzionalità:
 *  1. Lettura utente loggato dal cookie
 *  2. Lista conversazioni con polling
 *  3. Ricerca utenti nella sidebar per aprire nuove chat
 *  4. Apertura / creazione conversazione
 *  5. Caricamento + render messaggi (polling ogni 3s)
 *  6. Invio messaggi
 *  7. Logout
 */

const API = "/api";

// ─── Stato ───────────────────────────────────────────────────────────────────
const state = {
    email: null,
    userId: null,
    conversazioneId: null,
    altroUtente: null,
    pollingTimer: null,
    ultimoMessaggioId: null,
    searchTimer: null,
};

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const convList        = document.getElementById("convList");
const sidebarSub      = document.getElementById("sidebarSubtitle");
const chatPlaceholder = document.getElementById("chatPlaceholder");
const chatHeader      = document.getElementById("chatHeader");
const chatHeaderName  = document.getElementById("chatHeaderName");
const chatHeaderLink  = document.getElementById("chatHeaderLink");
const chatHeaderAv    = document.getElementById("chatHeaderAvatar");
const messagesWrap    = document.getElementById("messagesWrap");
const chatInputArea   = document.getElementById("chatInputArea");
const chatInput       = document.getElementById("chatInput");
const btnSend         = document.getElementById("btnSend");
const userSearchInput = document.getElementById("userSearchInput");
const searchResults   = document.getElementById("searchResults");
const searchClear     = document.getElementById("searchClear");
const btnLogout       = document.getElementById("btnLogout");

// ─── Avvio ────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    // Legge utente dal cookie (stesso sistema degli altri file JS del progetto)
    const rawCookie = document.cookie
        .split("; ")
        .find(row => row.startsWith("utente="));
    const utenteObj = rawCookie
        ? (() => { try { return JSON.parse(decodeURIComponent(rawCookie.split("=").slice(1).join("="))); } catch { return null; } })()
        : null;

    state.email  = utenteObj?.email || null;
    state.userId = utenteObj?.id    || null;

    if (!state.email) {
        window.location.href = "index.html";
        return;
    }

    bindLogout();
    bindSearch();
    await caricaConversazioni();

    // Se arriva da user.html con ?con=<userId>, apri subito la chat
    const params = new URLSearchParams(window.location.search);
    const targetUserId = params.get("con");
    if (targetUserId) {
        await apriOCreaConversazione(targetUserId);
    }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
function bindLogout() {
    if (!btnLogout) return;
    btnLogout.addEventListener("click", () => {
        // Cancella il cookie utente
        document.cookie = "utente=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "index.html";
    });
}

// ─── Ricerca utenti ───────────────────────────────────────────────────────────
function bindSearch() {
    if (!userSearchInput) return;

    userSearchInput.addEventListener("input", () => {
        const q = userSearchInput.value.trim();
        searchClear.style.display = q ? "flex" : "none";

        clearTimeout(state.searchTimer);
        if (!q) { hideSearchResults(); return; }

        state.searchTimer = setTimeout(() => cercaUtenti(q), 300);
    });

    searchClear.addEventListener("click", () => {
        userSearchInput.value = "";
        searchClear.style.display = "none";
        hideSearchResults();
        userSearchInput.focus();
    });

    // Chiudi risultati cliccando fuori
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".sidebar-search-wrap")) {
            hideSearchResults();
        }
    });
}

async function cercaUtenti(query) {
    try {
        const res = await fetch(`${API}/utenti/cerca?q=${encodeURIComponent(query)}&email=${encodeURIComponent(state.email)}`);
        if (!res.ok) { hideSearchResults(); return; }
        const data = await res.json();
        renderSearchResults(data.utenti || []);
    } catch (err) {
        console.error("Errore ricerca utenti:", err);
        hideSearchResults();
    }
}

function renderSearchResults(utenti) {
    if (!searchResults) return;

    if (!utenti.length) {
        searchResults.innerHTML = `<div class="search-result-empty">Nessun utente trovato.</div>`;
        searchResults.style.display = "block";
        return;
    }

    searchResults.innerHTML = "";
    utenti.forEach(u => {
        const item = document.createElement("div");
        item.className = "search-result-item";
        item.setAttribute("role", "option");
        item.setAttribute("tabindex", "0");
        item.setAttribute("aria-label", `Inizia chat con ${u.username}`);

        const avatarHtml = u.avatar
            ? `<div class="search-res-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.username)}"/></div>`
            : `<div class="search-res-avatar">${escapeHtml(u.username.charAt(0).toUpperCase())}</div>`;

        item.innerHTML = `
            ${avatarHtml}
            <div class="search-res-info">
                <div class="search-res-username">@${escapeHtml(u.username)}</div>
                <div class="search-res-name">${escapeHtml(u.nome || "")} ${escapeHtml(u.cognome || "")}</div>
            </div>`;

        item.addEventListener("click", async () => {
            hideSearchResults();
            userSearchInput.value = "";
            searchClear.style.display = "none";
            await apriOCreaConversazione(u.id);
        });
        item.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") item.click(); });

        searchResults.appendChild(item);
    });

    searchResults.style.display = "block";
}

function hideSearchResults() {
    if (searchResults) searchResults.style.display = "none";
}

// ─── Carica lista conversazioni ───────────────────────────────────────────────
async function caricaConversazioni() {
    try {
        const res = await fetch(`${API}/conversazioni?email=${encodeURIComponent(state.email)}`);
        const data = await res.json();

        convList.innerHTML = "";

        if (!data.conversazioni || data.conversazioni.length === 0) {
            convList.innerHTML = `
                <div class="conv-empty">
                    <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p>Nessuna conversazione ancora.<br>Cerca un utente qui sopra per iniziarne una.</p>
                </div>`;
            sidebarSub.textContent = "0 conversazioni";
            return;
        }

        const n = data.conversazioni.length;
        sidebarSub.textContent = `${n} conversazion${n === 1 ? "e" : "i"}`;
        data.conversazioni.forEach(conv => renderConvItem(conv));
    } catch (err) {
        console.error("Errore caricamento conversazioni:", err);
        convList.innerHTML = `<div class="conv-empty"><p>Errore nel caricamento.</p></div>`;
    }
}

// ─── Render item sidebar ──────────────────────────────────────────────────────
function renderConvItem(conv) {
    const item = document.createElement("div");
    item.className = "conv-item";
    item.dataset.convId   = conv.id;
    item.dataset.userId   = conv.altroUtente.id;
    item.dataset.username = conv.altroUtente.username;
    item.dataset.avatar   = conv.altroUtente.avatar || "";
    item.setAttribute("role", "listitem");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `Conversazione con ${conv.altroUtente.username}`);

    const avatarHtml = conv.altroUtente.avatar
        ? `<div class="conv-avatar"><img src="${escapeHtml(conv.altroUtente.avatar)}" alt="${escapeHtml(conv.altroUtente.username)}"/></div>`
        : `<div class="conv-avatar-placeholder">${escapeHtml(conv.altroUtente.username.charAt(0).toUpperCase())}</div>`;

    const preview = conv.ultimoMessaggio
        ? escapeHtml(conv.ultimoMessaggio).substring(0, 45) + (conv.ultimoMessaggio.length > 45 ? "…" : "")
        : "<em>Nessun messaggio</em>";

    const badge = conv.nonLetti > 0
        ? `<span class="conv-badge" aria-label="${conv.nonLetti} messaggi non letti">${conv.nonLetti}</span>`
        : "";

    item.innerHTML = `
        ${avatarHtml}
        <div class="conv-info">
            <div class="conv-username">@${escapeHtml(conv.altroUtente.username)}</div>
            <div class="conv-preview">${preview}</div>
        </div>
        ${badge}`;

    item.addEventListener("click", () => apriConversazione(conv.id, {
        id:       conv.altroUtente.id,
        username: conv.altroUtente.username,
        avatar:   conv.altroUtente.avatar,
    }));
    item.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") item.click(); });

    convList.appendChild(item);
}

// ─── Apri conversazione esistente ────────────────────────────────────────────
async function apriConversazione(convId, altroUtente) {
    if (state.pollingTimer) clearInterval(state.pollingTimer);

    state.conversazioneId = convId;
    state.altroUtente     = altroUtente;

    // Active state nella sidebar
    document.querySelectorAll(".conv-item").forEach(el => {
        el.classList.toggle("active", el.dataset.convId === convId);
    });

    // Mostra componenti chat
    chatPlaceholder.style.display = "none";
    chatHeader.style.display      = "flex";
    messagesWrap.style.display    = "flex";
    chatInputArea.style.display   = "flex";

    // Popola header
    chatHeaderName.textContent = `@${altroUtente.username}`;
    chatHeaderLink.href        = `user.html?id=${altroUtente.id}`;
    chatHeaderAv.innerHTML = altroUtente.avatar
        ? `<div class="chat-header-avatar"><img src="${escapeHtml(altroUtente.avatar)}" alt="${escapeHtml(altroUtente.username)}"/></div>`
        : `<div class="chat-header-avatar-placeholder">${escapeHtml(altroUtente.username.charAt(0).toUpperCase())}</div>`;

    // Skeleton loader messaggi
    messagesWrap.innerHTML = `
        <div class="skeleton skel-msg"></div>
        <div class="skeleton skel-msg mine"></div>
        <div class="skeleton skel-msg"></div>`;

    await caricaMessaggi();
    state.pollingTimer = setInterval(caricaMessaggi, 3000);
    chatInput.focus();
}

// ─── Crea o recupera conversazione ───────────────────────────────────────────
async function apriOCreaConversazione(targetUserId) {
    try {
        const res = await fetch(`${API}/conversazioni`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: state.email, destinatarioId: targetUserId }),
        });
        const data = await res.json();

        if (!res.ok || !data.conversazioneId) {
            console.error("Impossibile creare/trovare conversazione:", data);
            return;
        }

        // Cerca se esiste già nella sidebar
        const existing = convList.querySelector(`[data-conv-id="${data.conversazioneId}"]`);
        if (existing) {
            existing.click();
        } else {
            await caricaConversazioni();
            const newItem = convList.querySelector(`[data-conv-id="${data.conversazioneId}"]`);
            if (newItem) newItem.click();
        }

        // Rimuovi il parametro dall'URL
        const url = new URL(window.location.href);
        url.searchParams.delete("con");
        window.history.replaceState({}, "", url.toString());
    } catch (err) {
        console.error("Errore apertura conversazione:", err);
    }
}

// ─── Carica messaggi ─────────────────────────────────────────────────────────
async function caricaMessaggi() {
    if (!state.conversazioneId) return;

    try {
        const res = await fetch(
            `${API}/conversazioni/${state.conversazioneId}/messaggi?email=${encodeURIComponent(state.email)}&limit=100`
        );
        const data = await res.json();
        if (!res.ok) return;

        const msgs = data.messaggi || [];

        // Evita re-render se non ci sono nuovi messaggi
        const lastId = msgs.length ? msgs[msgs.length - 1].id : null;
        if (lastId === state.ultimoMessaggioId && messagesWrap.childElementCount > 3) return;
        state.ultimoMessaggioId = lastId;

        const wasAtBottom = isAtBottom();
        renderMessaggi(msgs);
        if (wasAtBottom) scrollToBottom();

        // Rimuovi badge non letti nella sidebar
        const item = convList.querySelector(`[data-conv-id="${state.conversazioneId}"]`);
        if (item) { const badge = item.querySelector(".conv-badge"); if (badge) badge.remove(); }
    } catch (err) {
        console.error("Errore caricamento messaggi:", err);
    }
}

// ─── Render messaggi ─────────────────────────────────────────────────────────
function renderMessaggi(msgs) {
    if (!msgs.length) {
        messagesWrap.innerHTML = `
            <div class="conv-empty" style="flex:1;justify-content:center;">
                <p>Nessun messaggio ancora. Di' ciao! 👋</p>
            </div>`;
        return;
    }

    let html = "";
    let lastDate     = null;
    let lastSenderId = null;
    let groupOpen    = false;

    msgs.forEach(msg => {
        const isMine  = msg.mittenteId === state.userId;
        const msgDate = msg.createdAt ? new Date(msg.createdAt) : new Date();

        // Separatore data
        const dateKey = msgDate.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
        if (dateKey !== lastDate) {
            if (groupOpen) { html += `</div>`; groupOpen = false; }
            html += `<div class="date-sep" aria-label="Messaggi del ${dateKey}">${dateKey}</div>`;
            lastDate     = dateKey;
            lastSenderId = null;
        }

        const isNewSender = msg.mittenteId !== lastSenderId;
        if (isNewSender) {
            if (groupOpen) { html += `</div>`; groupOpen = false; }
            const groupClass = isMine ? "mine" : "theirs";
            html += `<div class="msg-group ${groupClass}">`;
            groupOpen = true;
            if (!isMine) {
                html += `<div class="msg-sender-name">@${escapeHtml(msg.mittenteUsername)}</div>`;
            }
        }

        const timeStr = msgDate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
        html += `<div class="msg-bubble" title="${timeStr}">${escapeHtml(msg.testo)}</div>`;
        lastSenderId = msg.mittenteId;
    });

    if (groupOpen) html += `</div>`;

    // Ora dell'ultimo messaggio
    const last     = msgs[msgs.length - 1];
    const lastTime = last.createdAt
        ? new Date(last.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
        : "";
    const isMine = last.mittenteId === state.userId;
    html += `<div class="msg-meta" style="align-self:${isMine ? "flex-end" : "flex-start"}">${lastTime}</div>`;

    messagesWrap.innerHTML = html;
}

// ─── Invio messaggio ──────────────────────────────────────────────────────────
async function inviaMessaggio() {
    const testo = chatInput.value.trim();
    if (!testo || !state.conversazioneId) return;

    btnSend.disabled = true;

    try {
        const res = await fetch(`${API}/conversazioni/${state.conversazioneId}/messaggi`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: state.email, testo }),
        });

        if (res.ok) {
            chatInput.value = "";
            adjustTextareaHeight();
            await caricaMessaggi();
            scrollToBottom();
            // Aggiorna preview nella sidebar
            const item = convList.querySelector(`[data-conv-id="${state.conversazioneId}"]`);
            if (item) { const preview = item.querySelector(".conv-preview"); if (preview) preview.textContent = testo.substring(0, 45); }
        } else {
            const data = await res.json();
            console.error("Errore invio:", data.message);
        }
    } catch (err) {
        console.error("Errore invio messaggio:", err);
    } finally {
        btnSend.disabled = false;
        chatInput.focus();
    }
}

// ─── Event listeners ──────────────────────────────────────────────────────────
chatInput.addEventListener("input", () => {
    adjustTextareaHeight();
    btnSend.disabled = chatInput.value.trim().length === 0;
});

chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!btnSend.disabled) inviaMessaggio();
    }
});

btnSend.addEventListener("click", inviaMessaggio);

function adjustTextareaHeight() {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function isAtBottom() {
    if (!messagesWrap) return true;
    return messagesWrap.scrollHeight - messagesWrap.scrollTop - messagesWrap.clientHeight < 60;
}

function scrollToBottom() {
    if (messagesWrap) messagesWrap.scrollTop = messagesWrap.scrollHeight;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
