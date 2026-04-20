import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# Carichiamo le variabili dal file .env
load_dotenv()

# Configurazione Cloudinary
cloudinary.config(
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key = os.getenv('CLOUDINARY_API_KEY'),
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
)

def carica_immagine_locale(percorso_file):
    """
    Funzione per caricare un'immagine dal tuo computer su Cloudinary.
    """
    if not os.path.exists(percorso_file):
        print(f"Errore: Il file {percorso_file} non esiste.")
        return

    try:
        print(f"Caricamento di {percorso_file} in corso...")
        risultato = cloudinary.uploader.upload(percorso_file)
        
        # L'URL sicuro dell'immagine caricata
        url_immagine = risultato.get('secure_url')
        print("--- Caricamento Completato! ---")
        print(f"URL Immagine: {url_immagine}")
        return url_immagine
        
    except Exception as e:
        print(f"Si è verificato un errore: {e}")

if __name__ == "__main__":
    # ESEMPIO D'USO:
    # Sostituisci questo percorso con quello di un'immagine sul tuo PC
    # percorso = "C:/Users/jacop/Desktop/mia_foto.jpg"
    # carica_immagine_locale(percorso)
    print("Modifica il file 'test_upload.py' inserendo il percorso di un'immagine per testare.")
