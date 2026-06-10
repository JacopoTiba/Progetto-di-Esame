from datetime import datetime
import os
import re

from bson import ObjectId
from bson.errors import InvalidId
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import cloudinary
import cloudinary.uploader

from .auth import genera_codice, invia_mail_codice
from .database import credenziali, recensioni, storie, conversazioni, messaggi

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

app = Flask(__name__, static_folder="../static", static_url_path="")
CORS(app)
bcrypt = Bcrypt(app)


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
        "bio": utente.get("bio", ""),
        "avatar": utente.get("avatar", ""),
        "followersCount": len(utente.get("followers", [])),
        "followingCount": len(utente.get("following", [])),
    }


def _serialize_story(storia):
    id_utente = storia.get("idUtente")
    if isinstance(id_utente, str):
        id_utente = _to_object_id(id_utente)
    autore = credenziali.find_one({"_id": id_utente}) if id_utente else None
    liked_by = storia.get("likedBy", [])
    return {
        "id": str(storia.get("_id")),
        "titolo": storia.get("titolo", ""),
        "descrizione": storia.get("descrizione", ""),
        "contenuto": storia.get("contenuto", ""),
        "genere": storia.get("genere", ""),
        "tags": storia.get("tags", []),
        "status": storia.get("status", "draft"),
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

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    nuovo_utente = {
        "nome": nome,
        "cognome": cognome,
        "username": username,
        "email": email,
        "password": hashed_password,
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
    email = data.get("email")
    password = data.get("password")

    utente = credenziali.find_one({"email": email})

    if not utente or not bcrypt.check_password_hash(utente.get("password", ""), password):
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

    # Solo storie pubblicate per profili pubblici
    storie_utente = list(storie.find({"idUtente": oid, "status": "published"}).sort("_id", -1))
    lista_storie = [_serialize_story(s) for s in storie_utente]

    response = _safe_user(utente)
    response["storie"] = lista_storie

    # Verifica se l'utente loggato segue già questo profilo
    viewer_email = request.args.get("email")
    if viewer_email:
        viewer = _get_current_user_from_email(viewer_email)
        if viewer:
            followers = utente.get("followers", [])
            response["isFollowing"] = viewer["_id"] in followers
        else:
            response["isFollowing"] = False
    else:
        response["isFollowing"] = False

    return jsonify(response), 200


@app.route("/api/utenti/<id>", methods=["PUT"])
def aggiorna_utente(id):
    """Aggiorna bio e/o avatar dell'utente."""
    oid = _to_object_id(id)
    if not oid:
        return jsonify({"message": "ID utente non valido"}), 400

    utente = credenziali.find_one({"_id": oid})
    if not utente:
        return jsonify({"message": "Utente non trovato"}), 404

    data = request.json or {}
    email = data.get("email")
    current_user = _get_current_user_from_email(email)
    if not current_user or current_user["_id"] != oid:
        return jsonify({"message": "Non autorizzato"}), 401

    aggiornamenti = {}

    # Aggiorna la bio se fornita
    if "bio" in data:
        aggiornamenti["bio"] = data["bio"]

    # Aggiorna l'avatar se fornito come base64
    avatar_base64 = data.get("avatarBase64")
    if avatar_base64:
        if avatar_base64.startswith("data:"):
            try:
                upload_result = cloudinary.uploader.upload(avatar_base64)
                aggiornamenti["avatar"] = upload_result.get("secure_url", "")
            except Exception as exc:
                return jsonify({"message": f"Errore caricamento avatar: {str(exc)}"}), 500
        elif avatar_base64.startswith("http"):
            aggiornamenti["avatar"] = avatar_base64

    if not aggiornamenti:
        return jsonify({"message": "Nessun dato da aggiornare"}), 400

    credenziali.update_one({"_id": oid}, {"$set": aggiornamenti})
    updated = credenziali.find_one({"_id": oid})
    return jsonify({"message": "Profilo aggiornato con successo", "user": _safe_user(updated)}), 200


@app.route("/api/utenti/cerca", methods=["GET"])
def cerca_utenti():
    """Cerca utenti per username (ricerca parziale, case-insensitive). Esclude l'utente loggato."""
    q = (request.args.get("q") or "").strip()
    email_corrente = (request.args.get("email") or "").strip()

    if not q or len(q) < 2:
        return jsonify({"utenti": []}), 200

    # Ricerca con regex case-insensitive
    pattern = re.compile(re.escape(q), re.IGNORECASE)
    docs = list(credenziali.find(
        {"username": {"$regex": pattern}, "verificato": True},
        {"_id": 1, "username": 1, "nome": 1, "cognome": 1, "avatar": 1, "email": 1}
    ).limit(10))

    # Escludi l'utente corrente
    result = []
    for u in docs:
        if u.get("email") == email_corrente:
            continue
        result.append({
            "id":       str(u["_id"]),
            "username": u.get("username", ""),
            "nome":     u.get("nome", ""),
            "cognome":  u.get("cognome", ""),
            "avatar":   u.get("avatar", ""),
        })

    return jsonify({"utenti": result}), 200


@app.route("/api/utenti/email/<path:email>", methods=["GET"])
def get_utente_by_email(email):
    utente = credenziali.find_one({"email": email})
    if not utente:
        return jsonify({"message": "Utente non trovato"}), 404

    # Solo storie pubblicate per profili pubblici
    storie_utente = list(storie.find({"idUtente": utente["_id"], "status": "published"}).sort("_id", -1))
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
@app.route("/api/generi", methods=["GET"])
def get_generi():
    """Restituisce tutti i generi distinti dalle storie pubblicate."""
    pipeline = [
        {"$match": {"status": "published", "genere": {"$ne": ""}}},
        {"$group": {"_id": "$genere"}},
        {"$sort": {"_id": 1}},
    ]
    docs = list(storie.aggregate(pipeline))
    generi = [doc["_id"] for doc in docs if doc["_id"]]
    return jsonify({"generi": generi}), 200


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
    limit = request.args.get("limit", default=None, type=int)
    skip = request.args.get("skip", default=0, type=int)

    docs = list(storie.find({"status": "published"}).sort("_id", -1))
    serialized = [_serialize_story(doc) for doc in docs]

    if query:
        serialized = [
            s for s in serialized
            if query in s.get("titolo", "").lower()
            or query in s.get("autore", "").lower()
            or query in s.get("descrizione", "").lower()
            or any(query in tag.lower() for tag in s.get("tags", []))
        ]

    if genre and genre != "all":
        serialized = [s for s in serialized if s.get("genere", "").lower() == genre]

    # Applichiamo paginazione sulla lista filtrata
    total_found = len(serialized)
    
    start = skip
    end = (skip + limit) if limit else total_found
    
    paginated = serialized[start:end]

    return jsonify({
        "storie": paginated,
        "total": total_found,
        "hasMore": end < total_found
    }), 200


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

    email = request.args.get("email")
    if email:
        user = _get_current_user_from_email(email)
        if user:
            payload["isLiked"] = user["_id"] in storia.get("likedBy", [])
    else:
        payload["isLiked"] = False

    return jsonify(payload), 200


@app.route("/api/storie/mie", methods=["GET"])
def get_storie_mie():
    """Restituisce TUTTE le storie (bozze + pubblicate) dell'utente loggato."""
    email = (request.args.get("email") or "").strip()
    if not email:
        return jsonify({"message": "Email obbligatoria"}), 401

    utente = _get_current_user_from_email(email)
    if not utente:
        return jsonify({"message": "Utente non trovato"}), 404

    docs = list(storie.find({"idUtente": utente["_id"]}).sort("_id", -1))
    serialized = [_serialize_story(doc) for doc in docs]
    return jsonify({"storie": serialized}), 200


@app.route("/api/storie/<id>", methods=["PUT"])
def aggiorna_storia(id):
    """Aggiorna titolo, sinossi, contenuto, genere, tag, immagine e stato di una storia."""
    oid = _to_object_id(id)
    if not oid:
        return jsonify({"message": "ID storia non valido"}), 400

    storia = storie.find_one({"_id": oid})
    if not storia:
        return jsonify({"message": "Storia non trovata"}), 404

    data = request.json or {}
    email_autore = data.get("autore_email")
    utente = _get_current_user_from_email(email_autore)
    if not utente:
        return jsonify({"message": "Non autorizzato"}), 401

    # Verifica che l'utente loggato sia l'autore della storia
    if storia.get("idUtente") != utente["_id"]:
        return jsonify({"message": "Non sei l'autore di questa storia"}), 403

    # Gestione immagine di copertina
    cover_base64 = data.get("coverBase64")
    img_url = storia.get("imgStoria", "")
    if cover_base64 and cover_base64.startswith("data:"):
        # Nuova immagine in base64 → carica su Cloudinary
        try:
            upload_result = cloudinary.uploader.upload(cover_base64)
            img_url = upload_result.get("secure_url", img_url)
        except Exception as exc:
            return jsonify({"message": f"Errore caricamento immagine: {str(exc)}"}), 500
    elif cover_base64 and cover_base64.startswith("http"):
        # URL esistente → mantieni
        img_url = cover_base64
    elif cover_base64 is None:
        # Rimosso dall'utente → svuota
        img_url = ""

    aggiornamenti = {
        "titolo": data.get("title", storia.get("titolo", "")),
        "descrizione": data.get("summary", storia.get("descrizione", "")),
        "contenuto": data.get("content", storia.get("contenuto", "")),
        "genere": data.get("genre", storia.get("genere", "")),
        "tags": data.get("tags", storia.get("tags", [])),
        "status": data.get("status", storia.get("status", "draft")),
        "imgStoria": img_url,
    }

    storie.update_one({"_id": oid}, {"$set": aggiornamenti})
    return jsonify({"message": "Storia aggiornata con successo", "id": str(oid)}), 200


@app.route("/api/storie/<id>", methods=["DELETE"])
def elimina_storia(id):
    """Elimina una storia (solo l'autore può farlo)."""
    oid = _to_object_id(id)
    if not oid:
        return jsonify({"message": "ID storia non valido"}), 400

    storia = storie.find_one({"_id": oid})
    if not storia:
        return jsonify({"message": "Storia non trovata"}), 404

    data = request.json or {}
    utente = _get_current_user_from_email(data.get("email"))
    if not utente:
        return jsonify({"message": "Non autorizzato"}), 401

    if storia.get("idUtente") != utente["_id"]:
        return jsonify({"message": "Non sei l'autore di questa storia"}), 403

    storie.delete_one({"_id": oid})
    # Rimuovi dai preferiti di tutti gli utenti
    credenziali.update_many({}, {"$pull": {"preferiti": oid}})
    return jsonify({"message": "Storia eliminata con successo"}), 200


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
    if not testo:
        return jsonify({"message": "Testo commento obbligatorio"}), 400

    commento = {
        "storiaId": story_oid,
        "userId": current_user["_id"],
        "username": current_user.get("username", "Utente"),
        "testo": testo,
        "createdAt": datetime.utcnow(),
    }

    res = recensioni.insert_one(commento)
    return jsonify({"message": "Commento aggiunto", "id": str(res.inserted_id)}), 201


# ─────────────────────────────────────────────
# ROTTE CHAT PRIVATA
# ─────────────────────────────────────────────

@app.route("/api/conversazioni", methods=["GET"])
def get_conversazioni():
    """Restituisce tutte le conversazioni dell'utente loggato."""
    email = (request.args.get("email") or "").strip()
    if not email:
        return jsonify({"message": "Email obbligatoria"}), 401

    utente = _get_current_user_from_email(email)
    if not utente:
        return jsonify({"message": "Utente non trovato"}), 404

    user_oid = utente["_id"]

    # Trova tutte le conversazioni in cui l'utente è partecipante
    docs = list(conversazioni.find({"partecipanti": user_oid}).sort("ultimoMessaggioAt", -1))

    result = []
    for conv in docs:
        partecipanti_ids = conv.get("partecipanti", [])
        # Trova l'altro partecipante
        altro_id = next((p for p in partecipanti_ids if p != user_oid), None)
        altro_utente = credenziali.find_one({"_id": altro_id}) if altro_id else None

        result.append({
            "id": str(conv["_id"]),
            "altroUtente": {
                "id": str(altro_utente["_id"]) if altro_utente else "",
                "username": altro_utente.get("username", "Utente") if altro_utente else "Utente",
                "avatar": altro_utente.get("avatar", "") if altro_utente else "",
            },
            "ultimoMessaggio": conv.get("ultimoMessaggio", ""),
            "ultimoMessaggioAt": conv.get("ultimoMessaggioAt").isoformat() if conv.get("ultimoMessaggioAt") else None,
            "nonLetti": conv.get(f"nonLetti_{str(user_oid)}", 0),
        })

    return jsonify({"conversazioni": result}), 200


@app.route("/api/conversazioni", methods=["POST"])
def ottieni_o_crea_conversazione():
    """Trova o crea una conversazione privata tra due utenti."""
    data = request.json or {}
    email_mittente = data.get("email")
    id_destinatario = data.get("destinatarioId")

    mittente = _get_current_user_from_email(email_mittente)
    if not mittente:
        return jsonify({"message": "Non autenticato"}), 401

    dest_oid = _to_object_id(id_destinatario)
    if not dest_oid:
        return jsonify({"message": "ID destinatario non valido"}), 400

    destinatario = credenziali.find_one({"_id": dest_oid})
    if not destinatario:
        return jsonify({"message": "Destinatario non trovato"}), 404

    if mittente["_id"] == dest_oid:
        return jsonify({"message": "Non puoi chattare con te stesso"}), 400

    # Cerca conversazione esistente tra i due (indipendente dall'ordine)
    conv = conversazioni.find_one({
        "partecipanti": {"$all": [mittente["_id"], dest_oid]}
    })

    if not conv:
        # Crea nuova conversazione
        nuovo = {
            "partecipanti": [mittente["_id"], dest_oid],
            "ultimoMessaggio": "",
            "ultimoMessaggioAt": datetime.utcnow(),
            f"nonLetti_{str(mittente['_id'])}": 0,
            f"nonLetti_{str(dest_oid)}": 0,
        }
        res = conversazioni.insert_one(nuovo)
        conv_id = str(res.inserted_id)
    else:
        conv_id = str(conv["_id"])

    return jsonify({"conversazioneId": conv_id}), 200


@app.route("/api/conversazioni/<conv_id>/messaggi", methods=["GET"])
def get_messaggi(conv_id):
    """Restituisce i messaggi di una conversazione (con paginazione)."""
    conv_oid = _to_object_id(conv_id)
    if not conv_oid:
        return jsonify({"message": "ID conversazione non valido"}), 400

    conv = conversazioni.find_one({"_id": conv_oid})
    if not conv:
        return jsonify({"message": "Conversazione non trovata"}), 404

    # Verifica che l'utente sia partecipante
    email = (request.args.get("email") or "").strip()
    utente = _get_current_user_from_email(email)
    if not utente or utente["_id"] not in conv.get("partecipanti", []):
        return jsonify({"message": "Non autorizzato"}), 403

    # Paginazione: ultimi N messaggi
    limit = request.args.get("limit", default=50, type=int)
    skip = request.args.get("skip", default=0, type=int)

    docs = list(
        messaggi.find({"conversazioneId": conv_oid})
        .sort("createdAt", 1)
        .skip(skip)
        .limit(limit)
    )

    payload = []
    for doc in docs:
        payload.append({
            "id": str(doc["_id"]),
            "mittenteId": str(doc.get("mittenteId", "")),
            "mittenteUsername": doc.get("mittenteUsername", "Utente"),
            "mittenteAvatar": doc.get("mittenteAvatar", ""),
            "testo": doc.get("testo", ""),
            "createdAt": doc.get("createdAt").isoformat() if doc.get("createdAt") else None,
        })

    # Azzera i messaggi non letti per questo utente
    campo_non_letti = f"nonLetti_{str(utente['_id'])}"
    conversazioni.update_one({"_id": conv_oid}, {"$set": {campo_non_letti: 0}})

    return jsonify({"messaggi": payload}), 200


@app.route("/api/conversazioni/<conv_id>/messaggi", methods=["POST"])
def invia_messaggio(conv_id):
    """Invia un messaggio in una conversazione privata."""
    conv_oid = _to_object_id(conv_id)
    if not conv_oid:
        return jsonify({"message": "ID conversazione non valido"}), 400

    conv = conversazioni.find_one({"_id": conv_oid})
    if not conv:
        return jsonify({"message": "Conversazione non trovata"}), 404

    data = request.json or {}
    mittente = _get_current_user_from_email(data.get("email"))
    if not mittente or mittente["_id"] not in conv.get("partecipanti", []):
        return jsonify({"message": "Non autorizzato"}), 403

    testo = (data.get("testo") or "").strip()
    if not testo:
        return jsonify({"message": "Il messaggio non può essere vuoto"}), 400

    now = datetime.utcnow()
    nuovo_msg = {
        "conversazioneId": conv_oid,
        "mittenteId": mittente["_id"],
        "mittenteUsername": mittente.get("username", "Utente"),
        "mittenteAvatar": mittente.get("avatar", ""),
        "testo": testo,
        "createdAt": now,
    }
    res = messaggi.insert_one(nuovo_msg)

    # Aggiorna la conversazione con ultimo messaggio e incrementa non letti per l'altro
    partecipanti_ids = conv.get("partecipanti", [])
    altro_id = next((p for p in partecipanti_ids if p != mittente["_id"]), None)
    update_fields = {
        "ultimoMessaggio": testo[:80],
        "ultimoMessaggioAt": now,
    }
    if altro_id:
        update_fields[f"nonLetti_{str(altro_id)}"] = conv.get(f"nonLetti_{str(altro_id)}", 0) + 1

    conversazioni.update_one({"_id": conv_oid}, {"$set": update_fields})

    return jsonify({
        "message": "Messaggio inviato",
        "id": str(res.inserted_id),
        "createdAt": now.isoformat(),
    }), 201



if __name__ == "__main__":
    # Prende la porta dal file .env, altrimenti usa la 3000
    port = int(os.getenv("PORT", 3000))
    print(f"--- Avvio server su http://127.0.0.1:{port} ---")
    app.run(debug=True, host="0.0.0.0", port=port)
