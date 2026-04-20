from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from .database import credenziali, storie
from .auth import genera_codice, invia_mail_codice
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

# Carichiamo esplicitamente il .env anche qui
load_dotenv()

cloudinary.config(
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
  api_key = os.getenv('CLOUDINARY_API_KEY'),
  api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

app = Flask(__name__, static_folder='../static', static_url_path='')
CORS(app)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# --- ROTTE UTENTI ---
@app.route('/api/registrazione', methods=['POST'])
def registrazione():
    data = request.json
    # PESCHIAMO I NUOVI CAMPI
    email = data.get('email')
    password = data.get('password')
    nome = data.get('nome')
    cognome = data.get('cognome')     # <--- AGGIUNTO
    username = data.get('username')   # <--- AGGIUNTO
    indirizzo = data.get('indirizzo') # <--- AGGIUNTO
    
    codice_verifica = genera_codice()
    
    # ... (tutta la parte del controllo utente esistente resta uguale) ...

    # SCENARIO C: AGGIORNIAMO IL DIZIONARIO PER MONGODB
    nuovo_utente = {
        "nome": nome,
        "cognome": cognome,
        "username": username,
        "email": email,
        "password": password,
        "indirizzo": indirizzo,
        "codice_verifica": codice_verifica,
        "verificato": False
    }

    if invia_mail_codice(email, codice_verifica, nome):
        credenziali.insert_one(nuovo_utente)
        return jsonify({"message": "Registrazione avviata! Codice inviato via mail."}), 201
    
    return jsonify({"message": "Errore invio mail, riprova."}), 500


@app.route('/api/verifica-codice', methods=['POST'])
def verifica_codice():
    data = request.json
    email = data.get('email')
    codice_inserito = data.get('codice')

    # Cerchiamo l'utente nel DB
    utente = credenziali.find_one({"email": email})

    if utente and utente.get('codice_verifica') == codice_inserito:
        # Codice corretto: aggiorniamo l'utente come "verificato"
        credenziali.update_one({"email": email}, {"$set": {"verificato": True}})
        return jsonify({"message": "Account verificato con successo!"}), 200
    else:
        return jsonify({"message": "Codice errato, riprova."}), 400
    
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    utente = credenziali.find_one({"email": data.get('email'), "password": data.get('password')})

    if utente:
        if utente.get('verificato') == True:
            return jsonify({
                "message": "login riuscito",
                "nome": utente.get('nome'),
                "username": utente.get('username'),
                "email": utente.get('email')
            }), 200
        else:
            return jsonify({"message": "Account non ancora verificato via mail!"}), 403
    
    return jsonify({"message": "Credenziali errate"}), 401

@app.route('/api/richiedi-codice', methods=['POST'])
def richiedi_codice():
    email = request.json.get('email')
    utente = credenziali.find_one({"email": email})
    
    if utente:
        codice = genera_codice()
        # Aggiorniamo l'utente esistente con il nuovo codice
        credenziali.update_one({"email": email}, {"$set": {"codice_verifica": codice}})
        
        if invia_mail_codice(email, codice, utente.get('nome')):
            return jsonify({"message": "Codice inviato via mail!"}), 200
        return jsonify({"message": "Errore tecnico nell'invio"}), 500
    
    return jsonify({"message": "Utente non trovato nel sistema"}), 404

# --- ROTTE CONTENUTI ---

@app.route('/api/storie', methods=['POST'])
def crea_storia():
    data = request.json
    if not data:
        return jsonify({"message": "Dati mancanti"}), 400
    
    # 1. Troviamo l'utente tramite l'email inviata dal frontend
    email_autore = data.get('autore_email')
    print(f"[DEBUG] Pubblicazione da: {email_autore}")
    if not email_autore:
        return jsonify({"message": "Non autorizzato: email mancante"}), 401
        
    utente = credenziali.find_one({"email": email_autore})
    if not utente:
        return jsonify({"message": f"Utente non trovato: {email_autore}"}), 403

    # 2. Gestiamo il caricamento immagine su Cloudinary
    img_url = ""
    cover_base64 = data.get('coverBase64')
    if cover_base64:
        try:
            print("[DEBUG] Caricamento immagine su Cloudinary...")
            upload_result = cloudinary.uploader.upload(cover_base64)
            img_url = upload_result.get('secure_url', '')
            print(f"[DEBUG] Immagine caricata: {img_url}")
        except Exception as e:
            print(f"[DEBUG] Errore Cloudinary: {e}")
            return jsonify({"message": f"Errore caricamento immagine: {str(e)}"}), 500

    # 3. Costruiamo e salviamo la storia
    nuova_storia = {
        "titolo": data.get('title', ''),
        "descrizione": data.get('summary', ''),
        "contenuto": data.get('content', ''),
        "genere": data.get('genre', ''),
        "tags": data.get('tags', []),
        "status": data.get('status', 'draft'),
        "imgStoria": img_url,
        "capitoli": 1,
        "nLike": 0,
        "completa": False,
        "idUtente": utente.get('_id')
    }
    
    result = storie.insert_one(nuova_storia)
    print(f"[DEBUG] Storia salvata con id: {result.inserted_id}")
    return jsonify({
        "message": "Storia salvata con successo", 
        "id": str(result.inserted_id)
    }), 201

@app.route('/api/storie', methods=['GET'])
def get_storie():
    from bson import ObjectId
    lista = []
    for storia in storie.find():
        # Cerchiamo l'autore tramite idUtente
        autore = credenziali.find_one({"_id": storia.get('idUtente')})
        
        lista.append({
            "id": str(storia['_id']),
            "titolo": storia.get('titolo', ''),
            "descrizione": storia.get('descrizione', ''),
            "genere": storia.get('genere', ''),
            "imgStoria": storia.get('imgStoria', ''),
            "capitoli": storia.get('capitoli', 0),
            "nLike": storia.get('nLike', 0),
            "completa": storia.get('completa', False),
            "idUtente": str(storia.get('idUtente', '')),
            "autore": autore.get('username') if autore else "Autore sconosciuto"
        })
    
    return jsonify({"storie": lista}), 200

@app.route('/api/storie/<id>', methods=['GET'])
def get_storia(id):
    from bson import ObjectId
    storia = storie.find_one({"_id": ObjectId(id)})
    if not storia:
        return jsonify({"message": "Storia non trovata"}), 404
    
    autore = credenziali.find_one({"_id": storia.get('idUtente')})
    
    return jsonify({
        "id": str(storia['_id']),
        "titolo": storia.get('titolo', ''),
        "contenuto": storia.get('contenuto', ''),
        "descrizione": storia.get('descrizione', ''),
        "genere": storia.get('genere', ''),
        "imgStoria": storia.get('imgStoria', ''),
        "capitoli": storia.get('capitoli', 0),
        "nLike": storia.get('nLike', 0),
        "completa": storia.get('completa', False),
        "idUtente": str(storia.get('idUtente', '')),
        "autore": autore.get('username') if autore else "Autore sconosciuto"
    }), 200

@app.route('/api/utenti/<id>', methods=['GET'])
def get_utente(id):
    from bson import ObjectId
    utente = credenziali.find_one({"_id": ObjectId(id)})
    if not utente:
        return jsonify({"message": "Utente non trovato"}), 404
    
    # Cerchiamo le storie dell'utente
    storie_utente = list(storie.find({"idUtente": ObjectId(id)}))
    lista_storie = []
    for storia in storie_utente:
        lista_storie.append({
            "id": str(storia['_id']),
            "titolo": storia.get('titolo', ''),
            "descrizione": storia.get('descrizione', ''),
            "genere": storia.get('genere', ''),
            "imgStoria": storia.get('imgStoria', ''),
            "capitoli": storia.get('capitoli', 0),
            "nLike": storia.get('nLike', 0),
        })
    
    return jsonify({
        "id": str(utente['_id']),
        "nome": utente.get('nome', ''),
        "cognome": utente.get('cognome', ''),
        "username": utente.get('username', ''),
        "storie": lista_storie
    }), 200

if __name__ == "__main__":
    app.run(port=3000, debug=True)