# ☕ Café o Té — Juego Multijugador Online

Juego viral de adivinanza mental. Un jugador piensa en una persona/personaje, el otro adivina haciendo preguntas tipo "¿Café o Té?".

---

## 🚀 Despliegue en Google Cloud Run (GRATIS para siempre)

### Requisitos previos
- Cuenta de Google (Gmail sirve)
- Instalar [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

### Pasos (copia y pega en tu terminal)

```bash
# 1. Haz login con tu cuenta Google
gcloud auth login

# 2. Crea un proyecto nuevo
gcloud projects create cafe-o-te-juego --name="Cafe o Te"
gcloud config set project cafe-o-te-juego

# 3. Activa los servicios necesarios
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 4. Entra en la carpeta del proyecto
cd cafe-o-te

# 5. Despliega con UN solo comando
gcloud run deploy cafe-o-te \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080
```

Espera ~2 minutos. Google te dará una URL tipo:
https://cafe-o-te-xxxx-ew.a.run.app  <-- comparte este enlace!

### ¿Por qué es gratis?
Google Cloud Run incluye permanentemente cada mes:
- 2 millones de requests gratis
- 180.000 vCPU-segundos gratis
- 360.000 GiB-segundos gratis

Para un juego pequeño/mediano nunca superarás el límite gratuito.

NOTA: Google pide vincular una tarjeta al crear la cuenta de facturación,
pero NO cobra mientras estés dentro del free tier. Puedes poner un
límite de gasto de $0 en la consola para más tranquilidad.

---

## Alternativas sin tarjeta de crédito

Railway: https://railway.app
  1. New Project -> Deploy from GitHub repo
  2. Sube el código a GitHub y selecciónalo

Render: https://render.com
  1. New -> Web Service -> conecta GitHub
  2. Build: npm install / Start: npm start

---

## Probar en local

npm install
npm start
Abre http://localhost:3000

---

## Estructura del proyecto

cafe-o-te/
├── server.js       # Servidor Node.js + Socket.io
├── package.json    # Dependencias
├── Dockerfile      # Para Google Cloud Run
├── public/
│   ├── index.html  # Frontend
│   └── game.js     # Lógica cliente
└── README.md

## Tecnologías
- Backend: Node.js + Express + Socket.io
- Frontend: HTML + CSS + JavaScript vanilla
- Tiempo real: WebSockets puros (compatible con Cloud Run)
