from datetime import datetime
import os

from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import cloudinary
import cloudinary.uploader

from .auth import genera_codice, invia_mail_codice
from .database import credenziali, recensioni, storie

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

app = Flask(__name__, static_folder="../static", static_url_path="")
CORS(app)


def _to_object_id(value):
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def _safe_user(utente):
    return {
        "id": str(utente.get("_id")),
        "nome": utente.get("nome", ""),
        "cognome": utente.get("cognome", ""),
        "username": utente.get("username", ""),
        "email": utente.get("email", ""),
        "followersCount": len(utente.get("followers", [])),
        "followingCount": len(utente.get("following", [])),
    }


def _serialize_story(storia):
    autore = credenziali.find_one({"_id": storia.get("idUtente")})
    liked_by = storia.get("likedBy", [])
    return {
        "id": str(storia.get("_id")),
        "titolo": storia.get("titolo", ""),
        "descrizione": storia.get("descrizione", ""),
        "contenuto": storia.get("contenuto", ""),
        "genere": storia.get("genere", ""),
        "imgStoria": storia.get("imgStoria", ""),
        "capitoli": storia.get("capitoli", 0),
        "nLike": storia.get("nLike", len(liked_by)),
        "completa": storia.get("completa", False),
        "idUtente": str(storia.get("idUtente", "")),
        "autore": autore.get("username") if autore else "Autore sconosciuto",
    }


def _get_current_user_from_email(email):
    if not email:
        return None
    return credenziali.find_one({"email": email})


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


# --- ROTTE UTENTI ---
@app.route("/api/registrazione", methods=["POST"])
def registrazione():
    data = request.json or {}

    email = data.get("email")
    password = data.get("password")
    nome = data.get("nome")
    cognome = data.get("cognome")
    username = data.get("username")
    indirizzo = data.get("indirizzo")

    if not email or not password or not nome or not username:
        return jsonify({"message": "Campi obbligatori mancanti"}), 400

    existing = credenziali.find_one({"$or": [{"email": email}, {"username": username}]})
    if existing:
        return jsonify({"message": "Utente gia esistente"}), 409

    codice_verifica = genera_codice()

    nuovo_utente = {
        "nome": nome,
        "cognome": cognome,
        "username": username,
        "email": email,
        "password": password,
        "indirizzo": indirizzo,
        "codice_verifica": codice_verifica,
        "verificato": False,
        "followers": [],
        "following": [],
        "preferiti": [],
    }

    if invia_mail_codice(email, codice_verifica, nome):
        credenziali.insert_one(nuovo_utente)
        return jsonify({"message": "Registrazione avviata! Codice inviato via mail."}), 201

    return jsonify({"message": "Errore invio mail, riprova."}), 500


@app.route("/api/verifica-codice", methods=["POST"])
def verifica_codice():
    data = request.json or {}
    email = data.get("email")
    codice_inserito = data.get("codice")

    utente = credenziali.find_one({"email": email})
    if utente and utente.get("codice_verifica") == codice_inserito:
        credenziali.update_one({"email": email}, {"$set": {"verificato": True}})
        return jsonify({"message": "Account verificato con successo!"}), 200

    return jsonify({"message": "Codice errato, riprova."}), 400


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    utente = credenziali.find_one({"email": data.get("email"), "password": data.get("password")})

    if not utente:
        return jsonify({"message": "Credenziali errate"}), 401

    if not utente.get("verificato"):
        return jsonify({"message": "Account non ancora verificato via mail!"}), 403

    payload = _safe_user(utente)
    payload["message"] = "login riuscito"
    return jsonify(payload), 200


@app.route("/api/richiedi-codice", methods=["POST"])
def richiedi_codice():
    email = (request.json or {}).get("email")
    utente = credenziali.find_one({"email": email})

    if not utente:
        return jsonify({"message": "Utente non trovato nel sistema"}), 404

    codice = genera_codice()
    credenziali.update_one({"email": email}, {"$set": {"codice_verifica": codice}})

    if invia_mail_codice(email, codice, utente.get("nome")):
        return jsonify({"message": "Codice inviato via mail!"}), 200

    return jsonify({"message": "Errore tecnico nell'invio"}), 500


@app.route("/api/utenti/<id>", methods=["GET"])
def get_utente(id):
    oid = _to_object_id(id)
    if not oid:
        return jsonify({"message": "ID utente non valido"}), 400

    utente = credenziali.find_one({"_id": oid})
    if not utente:
        return jsonify({"message": "Utente non trovato"}), 404

    storie_utente = list(storie.find({"idUtente": oid}))
    lista_storie = [_serialize_story(s) for s in storie_utente]

    response = _safe_user(utente)
    response["storie"] = lista_storie
    return jsonify(response), 200


@app.route("/api/utenti/email/<path:email>", methods=["GET"])
def get_utente_by_email(email):
    utente = credenziali.find_one({"email": email})
    if not utente:
        return jsonify({"message": "Utente non trovato"}), 404

    storie_utente = list(storie.find({"idUtente": utente["_id"]}))
    lista_storie = [_serialize_story(s) for s in storie_utente]

    response = _safe_user(utente)
    response["storie"] = lista_storie
    return jsonify(response), 200


@app.route("/api/utenti/<id>/follow", methods=["POST"])
def toggle_follow(id):
    target_oid = _to_object_id(id)
    if not target_oid:
        return jsonify({"message": "ID utente non valido"}), 400

    data = request.json or {}
    current_user = _get_current_user_from_email(data.get("email"))
    if not current_user:
        return jsonify({"message": "Utente corrente non autenticato"}), 401

    target_user = credenziali.find_one({"_id": target_oid})
    if not target_user:
        return jsonify({"message": "Utente target non trovato"}), 404

    if current_user["_id"] == target_oid:
        return jsonify({"message": "Non puoi seguire te stesso"}), 400

    current_following = current_user.get("following", [])
    target_followers = target_user.get("followers", [])

    is_following = target_oid in current_following

    if is_following:
        credenziali.update_one({"_id": current_user["_id"]}, {"$pull": {"following": target_oid}})
        credenziali.update_one({"_id": target_oid}, {"$pull": {"followers": current_user["_id"]}})
        is_following = False
    else:
        credenziali.update_one({"_id": current_user["_id"]}, {"$addToSet": {"following": target_oid}})
        credenziali.update_one({"_id": target_oid}, {"$addToSet": {"followers": current_user["_id"]}})
        is_following = True

    updated_target = credenziali.find_one({"_id": target_oid})
    return jsonify({
        "isFollowing": is_following,
        "followersCount": len(updated_target.get("followers", [])),
        "followingCount": len(updated_target.get("following", [])),
    }), 200


@app.route("/api/utenti/<id>/preferiti", methods=["GET"])
def get_preferiti(id):
    user_oid = _to_object_id(id)
    if not user_oid:
        return jsonify({"message": "ID utente non valido"}), 400

    utente = credenziali.find_one({"_id": user_oid})
    if not utente:
        return jsonify({"message": "Utente non trovato"}), 404

    preferiti_ids = utente.get("preferiti", [])
    if not preferiti_ids:
        return jsonify({"preferiti": []}), 200

    docs = list(storie.find({"_id": {"$in": preferiti_ids}}))
    serialized = [_serialize_story(doc) for doc in docs]
    return jsonify({"preferiti": serialized}), 200


# --- ROTTE CONTENUTI ---
@app.route("/api/storie", methods=["POST"])
def crea_storia():
    data = request.json or {}

    email_autore = data.get("autore_email")
    if not email_autore:
        return jsonify({"message": "Non autorizzato: email mancante"}), 401

    utente = credenziali.find_one({"email": email_autore})
    if not utente:
        return jsonify({"message": f"Utente non trovato: {email_autore}"}), 403

    img_url = ""
    cover_base64 = data.get("coverBase64")
    if cover_base64:
        try:
            upload_result = cloudinary.uploader.upload(cover_base64)
            img_url = upload_result.get("secure_url", "")
        except Exception as exc:
            return jsonify({"message": f"Errore caricamento immagine: {str(exc)}"}), 500

    nuova_storia = {
        "titolo": data.get("title", ""),
        "descrizione": data.get("summary", ""),
        "contenuto": data.get("content", ""),
        "genere": data.get("genre", ""),
        "tags": data.get("tags", []),
        "status": data.get("status", "draft"),
        "imgStoria": img_url,
        "capitoli": 1,
        "nLike": 0,
        "likedBy": [],
        "completa": False,
        "idUtente": utente.get("_id"),
    }

    result = storie.insert_one(nuova_storia)
    return jsonify({"message": "Storia salvata con successo", "id": str(result.inserted_id)}), 201


@app.route("/api/storie", methods=["GET"])
def get_storie():
    query = (request.args.get("query") or "").strip().lower()
    genre = (request.args.get("genre") or "").strip().lower()
    limit = request.args.get("limit", type=int)

    docs = list(storie.find())
    serialized = [_serialize_story(doc) for doc in docs]

    if query:
        serialized = [
            s for s in serialized
            if query in s.get("titolo", "").lower()
            or query in s.get("autore", "").lower()
            or query in s.get("descrizione", "").lower()
        ]

    if genre and genre != "all":
        serialized = [s for s in serialized if s.get("genere", "").lower() == genre]

    if limit and limit > 0:
        serialized = serialized[:limit]

    return jsonify({"storie": serialized}), 200


@app.route("/api/storie/<id>", methods=["GET"])
def get_storia(id):
    oid = _to_object_id(id)
    if not oid:
        return jsonify({"message": "ID storia non valido"}), 400

    storia = storie.find_one({"_id": oid})
    if not storia:
        return jsonify({"message": "Storia non trovata"}), 404

    payload = _serialize_story(storia)
    payload["contenuto"] = storia.get("contenuto", "")

    avg_result = list(recensioni.aggregate([
        {"$match": {"storiaId": oid}},
        {"$group": {"_id": "$storiaId", "avg": {"$avg": "$voto"}, "count": {"$sum": 1}}},
    ]))

    if avg_result:
        payload["ratingMedio"] = round(avg_result[0]["avg"], 1)
        payload["numRecensioni"] = avg_result[0]["count"]
    else:
        payload["ratingMedio"] = None
        payload["numRecensioni"] = 0

    return jsonify(payload), 200


@app.route("/api/storie/<id>/like", methods=["POST"])
def toggle_like(id):
    oid = _to_object_id(id)
    if not oid:
        return jsonify({"message": "ID storia non valido"}), 400

    storia = storie.find_one({"_id": oid})
    if not storia:
        return jsonify({"message": "Storia non trovata"}), 404

    data = request.json or {}
    current_user = _get_current_user_from_email(data.get("email"))
    if not current_user:
        return jsonify({"message": "Utente corrente non autenticato"}), 401

    liked_by = storia.get("likedBy", [])
    user_oid = current_user["_id"]
    liked = user_oid in liked_by

    if liked:
        storie.update_one({"_id": oid}, {"$pull": {"likedBy": user_oid}})
        liked = False
    else:
        storie.update_one({"_id": oid}, {"$addToSet": {"likedBy": user_oid}})
        liked = True

    updated = storie.find_one({"_id": oid})
    n_like = len(updated.get("likedBy", []))
    storie.update_one({"_id": oid}, {"$set": {"nLike": n_like}})

    return jsonify({"liked": liked, "nLike": n_like}), 200


@app.route("/api/storie/<id>/preferiti", methods=["POST"])
def toggle_preferito(id):
    story_oid = _to_object_id(id)
    if not story_oid:
        return jsonify({"message": "ID storia non valido"}), 400

    storia = storie.find_one({"_id": story_oid})
    if not storia:
        return jsonify({"message": "Storia non trovata"}), 404

    data = request.json or {}
    current_user = _get_current_user_from_email(data.get("email"))
    if not current_user:
        return jsonify({"message": "Utente corrente non autenticato"}), 401

    pref = current_user.get("preferiti", [])
    is_favorite = story_oid in pref

    if is_favorite:
        credenziali.update_one({"_id": current_user["_id"]}, {"$pull": {"preferiti": story_oid}})
        is_favorite = False
    else:
        credenziali.update_one({"_id": current_user["_id"]}, {"$addToSet": {"preferiti": story_oid}})
        is_favorite = True

    updated = credenziali.find_one({"_id": current_user["_id"]})
    return jsonify({"isFavorite": is_favorite, "favoritesCount": len(updated.get("preferiti", []))}), 200


@app.route("/api/storie/<id>/recensioni", methods=["GET"])
def get_recensioni(id):
    story_oid = _to_object_id(id)
    if not story_oid:
        return jsonify({"message": "ID storia non valido"}), 400

    docs = list(recensioni.find({"storiaId": story_oid}).sort("createdAt", -1))
    payload = []
    for doc in docs:
        payload.append({
            "id": str(doc.get("_id")),
            "username": doc.get("username", "Utente"),
            "voto": doc.get("voto", 0),
            "testo": doc.get("testo", ""),
            "createdAt": doc.get("createdAt").isoformat() if doc.get("createdAt") else None,
        })

    return jsonify({"recensioni": payload}), 200


@app.route("/api/storie/<id>/recensioni", methods=["POST"])
def add_recensione(id):
    story_oid = _to_object_id(id)
    if not story_oid:
        return jsonify({"message": "ID storia non valido"}), 400

    if not storie.find_one({"_id": story_oid}):
        return jsonify({"message": "Storia non trovata"}), 404

    data = request.json or {}
    current_user = _get_current_user_from_email(data.get("email"))
    if not current_user:
        return jsonify({"message": "Utente corrente non autenticato"}), 401

    testo = (data.get("testo") or "").strip()
    voto = int(data.get("voto") or 0)
    if not testo:
        return jsonify({"message": "Testo recensione obbligatorio"}), 400
    if voto < 1 or voto > 5:
        return jsonify({"message": "Voto non valido (1-5)"}), 400

    recensione = {
        "storiaId": story_oid,
        "userId": current_user["_id"],
        "username": current_user.get("username", "Utente"),
        "voto": voto,
        "testo": testo,
        "createdAt": datetime.utcnow(),
    }

    res = recensioni.insert_one(recensione)
    return jsonify({"message": "Recensione aggiunta", "id": str(res.inserted_id)}), 201


if __name__ == "__main__":
    app.run(debug=True, port=5000)
