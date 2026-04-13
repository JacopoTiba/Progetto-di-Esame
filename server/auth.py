import smtplib
import random
from email.message import EmailMessage

def genera_codice():
    # Crea il codice a 6 cifre (Rif. Python-Thread.pdf per generazione dati atomica)
    return str(random.randint(100000, 999999))

def invia_mail_codice(destinatario, codice, credenziali):
    msg = EmailMessage()
    msg.set_content(f"Ciao {credenziali}! Il tuo codice di verifica per Plotty è: {codice}")
    msg['Subject'] = 'Codice di Verifica Plotty'
    msg['From'] = "tibaldijacopo@gmail.com"  # <--- METTI LA TUA MAIL QUI
    msg['To'] = destinatario

    try:
       
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            # QUI DEVI USARE LA PASSWORD PER LE APP DI GOOGLE
            smtp.login("tibaldijacopo@gmail.com", "sojk hhjy wvpf qnco") 
            smtp.send_message(msg)
        return True
    except Exception as e:
        print(f"Errore Socket/SMTP: {e}") # Debug per vedere se il socket si chiude
        return False