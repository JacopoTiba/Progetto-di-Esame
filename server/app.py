from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from .database import credenziali, storie
from .auth import genera_codice, invia_mail_codice

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

@app.route('/api/storie', methods=['GET'])
def get_storie():
    # Recupera le storie dal DB (escludendo l'ID di Mongo per pulizia JSON)
    lista = list(storie.find({}, {"_id": 0}))
    return jsonify({"storie": lista}), 200

if __name__ == '__main__':
    app.run(debug=True, port=3000)

