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

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    # Cerchiamo tra gli utenti che hai già nel DB
    utente = credenziali.find_one({"email": data.get('email')})
    
    if utente and utente['password'] == data.get('password'):
        return jsonify({"message": "login riuscito"}), 200
    return jsonify({"message": "mail o password sbagliate"}), 401

@app.route('/api/richiedi-codice', methods=['POST'])
def richiedi_codice():
    email = request.json.get('email')
    utente = credenziali.find_one({"email": email})
    
    if utente:
        codice = genera_codice()
        # Aggiorniamo l'utente esistente con il nuovo codice
        credenziali.update_one({"email": email}, {"$set": {"codice_verifica": codice}})
        
        if invia_mail_codice(email, codice):
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