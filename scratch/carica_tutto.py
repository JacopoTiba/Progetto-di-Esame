"""
Script COMPLETO:
  1. Carica tutte le immagini rimaste in static/imgs/ su Cloudinary
  2. Aggiorna i riferimenti img/... e imgs/... in tutti i file HTML/CSS/JS
  3. Aggiorna anche i documenti MongoDB che puntano ancora a percorsi locali

COME USARLO:
  1. Assicurati di avere le credenziali Cloudinary nel file .env
  2. Attiva il tuo virtualenv (.venv)
  3. Dal terminale, nella cartella radice del progetto, esegui:
       python scratch/carica_tutto.py

  NOTA: lo script è IDEMPOTENTE – puoi eseguirlo più volte senza
        duplicare le immagini su Cloudinary (usa public_id fisso
        basato sul nome file).
"""

import os
import re
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pymongo import MongoClient

# ── CONFIGURAZIONE ────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR  = os.path.join(BASE_DIR, 'static')
IMGS_DIR    = os.path.join(STATIC_DIR, 'imgs')

load_dotenv(os.path.join(BASE_DIR, '.env'))

cloudinary.config(
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key    = os.getenv('CLOUDINARY_API_KEY'),
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

client = MongoClient(os.getenv("MONGO_URI"))
db     = client.get_database(os.getenv("DB_NAME", "Plotty"))
storie = db.storie

# Estensioni da cercare nei file statici
ESTENSIONI_CODICE = {'.html', '.css', '.js'}
# Pattern che matcha sia "img/nome.ext" che "imgs/nome.ext" (con o senza quotes)
PATTERN_IMG = re.compile(r'(imgs?/)([\w\-\.]+\.(jpg|jpeg|png|webp|gif|svg))', re.IGNORECASE)

# ── STEP 1: CARICA TUTTE LE IMMAGINI SU CLOUDINARY ───────────────────────────
def carica_tutte_le_immagini():
    """
    Carica ogni file in static/imgs/ su Cloudinary.
    Usa un public_id fisso (plotty/layout/<nome_senza_ext>) così se esegui
    lo script due volte non duplica nulla.
    Restituisce un dizionario:  { 'nome_file.ext': 'https://res.cloudinary.com/...' }
    """
    print("\n=== STEP 1: Caricamento immagini su Cloudinary ===")
    mappa = {}

    if not os.path.isdir(IMGS_DIR):
        print(f"  [WARN] Cartella imgs non trovata: {IMGS_DIR}")
        return mappa

    file_trovati = [f for f in os.listdir(IMGS_DIR) if os.path.isfile(os.path.join(IMGS_DIR, f))]
    print(f"  Trovati {len(file_trovati)} file.\n")

    for nome_file in file_trovati:
        percorso   = os.path.join(IMGS_DIR, nome_file)
        nome_senza = os.path.splitext(nome_file)[0]
        public_id  = f"plotty/layout/{nome_senza}"

        try:
            result = cloudinary.uploader.upload(
                percorso,
                public_id    = public_id,
                overwrite    = False,   # Non sovrascrive se esiste già
                unique_filename = False
            )
            url = result.get('secure_url')
            mappa[nome_file] = url
            print(f"  [OK] {nome_file}")
            print(f"       → {url}")
        except cloudinary.exceptions.Error as e:
            # Se il file esiste già su Cloudinary, recupera l'URL esistente
            if "already exists" in str(e) or "overwrite" in str(e).lower():
                try:
                    info = cloudinary.api.resource(public_id)
                    url  = info.get('secure_url')
                    mappa[nome_file] = url
                    print(f"  [SKIP - già su Cloudinary] {nome_file}")
                    print(f"       → {url}")
                except Exception as e2:
                    print(f"  [ERRORE recupero URL] {nome_file}: {e2}")
            else:
                print(f"  [ERRORE upload] {nome_file}: {e}")

    return mappa


# ── STEP 2: AGGIORNA I FILE HTML / CSS / JS ───────────────────────────────────
def aggiorna_file_codice(mappa):
    """
    Sostituisce ogni occorrenza di img/<nome> o imgs/<nome>
    nei file HTML/CSS/JS con l'URL Cloudinary corrispondente.
    """
    print("\n=== STEP 2: Aggiornamento riferimenti nei file statici ===")

    modificati = 0
    for nome_file in os.listdir(STATIC_DIR):
        estensione = os.path.splitext(nome_file)[1].lower()
        if estensione not in ESTENSIONI_CODICE:
            continue

        percorso = os.path.join(STATIC_DIR, nome_file)
        with open(percorso, 'r', encoding='utf-8') as f:
            contenuto = f.read()

        contenuto_originale = contenuto
        contatore = 0

        def sostituisci(match):
            nonlocal contatore
            nome_img = match.group(2)   # es. "ghibli-bg.png"
            if nome_img in mappa:
                contatore += 1
                return mappa[nome_img]  # URL Cloudinary completo
            return match.group(0)       # Non trovata → lascia invariata

        contenuto_nuovo = PATTERN_IMG.sub(sostituisci, contenuto)

        if contenuto_nuovo != contenuto_originale:
            with open(percorso, 'w', encoding='utf-8') as f:
                f.write(contenuto_nuovo)
            print(f"  [OK] {nome_file} – {contatore} sostituzioni")
            modificati += 1
        else:
            print(f"  [--] {nome_file} – nessuna modifica necessaria")

    print(f"\n  Totale file modificati: {modificati}")


# ── STEP 3: AGGIORNA MONGODB ───────────────────────────────────────────────────
def aggiorna_mongodb(mappa):
    """
    Aggiorna le storie che hanno ancora imgStoria con percorso locale.
    """
    print("\n=== STEP 3: Aggiornamento storie su MongoDB ===")

    aggiornate = 0
    for storia in storie.find({}):
        img = storia.get('imgStoria', '')

        # Salta se già URL Cloudinary
        if img.startswith('http'):
            continue

        # Prende solo il nome del file
        nome_file = os.path.basename(img)
        if nome_file in mappa:
            storie.update_one(
                {'_id': storia['_id']},
                {'$set': {'imgStoria': mappa[nome_file]}}
            )
            print(f"  [OK] '{storia.get('titolo', storia['_id'])}' → {mappa[nome_file]}")
            aggiornate += 1
        elif img:
            print(f"  [WARN] '{storia.get('titolo', storia['_id'])}' → immagine non trovata in mappa: '{img}'")

    print(f"\n  Storie aggiornate: {aggiornate}")


# ── MAIN ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  MIGRAZIONE COMPLETA IMMAGINI → CLOUDINARY")
    print("=" * 55)

    mappa_url = carica_tutte_le_immagini()

    if not mappa_url:
        print("\n[ATTENZIONE] Nessuna immagine caricata. Controlla le credenziali nel .env e la cartella imgs/.")
    else:
        print(f"\n  Mappa generata per {len(mappa_url)} immagini.")
        aggiorna_file_codice(mappa_url)
        aggiorna_mongodb(mappa_url)

    print("\n=== COMPLETATO ===")
    print("Puoi ora eliminare la cartella static/imgs/ in sicurezza.")
