from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# Il segreto è '../static': esce da server e va in static
app = Flask(__name__, static_folder='../static', static_url_path='')
CORS(app)

# Connessione (Assicurati che il file .env sia dentro la cartella server)
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database('plotty')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# ... resto del codice

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    # Qui andrà la logica di controllo password (hash)
    return jsonify({"message": "Login in fase di sviluppo"}), 200

@app.route('/api/storie', methods=['GET'])
def get_storie():
    # Qui recupererai le storie dal DB
    return jsonify({"storie": []}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)