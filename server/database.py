import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

# Connessione pulita usando il tuo .env
client = MongoClient(os.getenv("MONGO_URI"))
db = client.get_database(os.getenv("DB_NAME", "Plotty"))

# Esportiamo le collezioni che hai già popolato
credenziali = db.credenziali
storie = db.storie
recensioni = db.recensioni