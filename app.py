from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app) # Permette le richieste dal tuo frontend

# Connessione a MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database('plotty') # Nome del DB

# --- API ROTTE ---

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