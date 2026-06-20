# TrustMeBro AI — AI-Powered Cybersecurity Platform

> Detect phishing websites, malicious URLs, scam pages, fake login portals, and dangerous QR codes using Gemini AI, OCR, and computer vision.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Firebase Setup](#firebase-setup)
  - [Gemini API Setup](#gemini-api-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Chrome Extension Setup](#chrome-extension-setup)
- [Deployment](#deployment)
  - [Backend → Render](#backend--render)
  - [Frontend → Vercel](#frontend--vercel)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)

---

## Overview

TrustMeBro AI is a production-ready cybersecurity SaaS platform that uses Google Gemini AI to analyze URLs, screenshots, and QR codes for phishing, scam, and malware indicators — with special focus on Philippine banking brand impersonation (GCash, Maya, BDO, BPI).

---

## Features

| Feature | Status |
|---|---|
| URL Scanner (domain, SSL, keywords, age) | ✅ |
| Screenshot Analyzer (OCR + AI vision) | ✅ |
| QR Code Scanner (decode + URL analysis) | ✅ |
| Chrome Extension (MV3) | ✅ |
| Screen Capture from Extension | ✅ |
| Firebase Authentication (Google + Email) | ✅ |
| User Dashboard + Scan History | ✅ |
| Threat Analytics Charts | ✅ |
| Report Website Feature | ✅ |
| Dark Mode UI (Glassmorphism) | ✅ |
| Framer Motion Animations | ✅ |
| Mobile Responsive | ✅ |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | FastAPI (Python 3.11) |
| AI | Google Gemini 1.5 Flash |
| OCR | EasyOCR |
| QR | pyzbar + OpenCV |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Extension | Chrome MV3, TypeScript, Webpack |

---

## Folder Structure

```
trustlink-ai/
├── frontend/                     # Next.js 14 App
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── scan/page.tsx     # Scan tools
│   │   │   ├── dashboard/page.tsx
│   │   │   └── (auth)/           # Login / Signup
│   │   ├── components/
│   │   │   ├── landing/          # Hero, Features, FAQ, etc.
│   │   │   ├── scan/             # URLScanner, ScreenshotAnalyzer, QRScanner
│   │   │   └── dashboard/        # ScanHistory, ThreatAnalytics, Stats
│   │   ├── context/AuthContext.tsx
│   │   ├── lib/                  # firebase.ts, api.ts, utils.ts
│   │   └── types/index.ts
│   ├── .env.local.example
│   ├── package.json
│   └── vercel.json
│
├── backend/                      # FastAPI Python Server
│   ├── app/
│   │   ├── routes/               # scan.py, reports.py, history.py
│   │   ├── services/             # gemini, url_analyzer, image_analyzer, qr_processor, firebase
│   │   └── models/schemas.py
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml
│
├── chrome-extension/             # Chrome MV3 Extension
│   ├── src/
│   │   ├── popup.ts
│   │   ├── background.ts
│   │   └── content.ts
│   ├── public/
│   │   ├── manifest.json
│   │   ├── popup.html
│   │   └── styles.css
│   ├── webpack.config.js
│   └── package.json
│
└── README.md
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Google Chrome browser
- Git

---

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project: `trustlink-ai`
3. Enable **Authentication** → Sign-in methods: **Google** and **Email/Password**
4. Enable **Firestore Database** → Start in production mode
5. Add Firestore Security Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scans/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
    match /reports/{docId} {
      allow create: if true;
      allow read: if request.auth != null;
    }
  }
}
```

6. Go to **Project Settings** → **Service Accounts** → **Generate new private key**
7. Save as `backend/firebase-service-account.json`
8. Copy your Firebase Web SDK config (Project Settings → General → Your apps)

---

### Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click **Get API Key** → Create API Key
3. Copy the key — you'll use it as `GEMINI_API_KEY`

---

### Backend Setup

```bash
cd trustlink-ai/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set:
#   GEMINI_API_KEY=your_key
#   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
#   ALLOWED_ORIGINS=http://localhost:3000

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be running at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

---

### Frontend Setup

```bash
cd trustlink-ai/frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Firebase config and backend URL

# Start development server
npm run dev
```

App will be running at: http://localhost:3000

---

### Chrome Extension Setup

```bash
cd trustlink-ai/chrome-extension

# Install dependencies
npm install

# Build extension
npm run build
# Output will be in the dist/ folder

# Load in Chrome:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode" (top right toggle)
# 3. Click "Load unpacked"
# 4. Select the dist/ folder
```

> **Note**: Make sure the backend is running on `http://localhost:8000` for the extension to work locally.

---

## Deployment

### Backend → Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repository
4. Set root directory: `backend`
5. Render will detect the `render.yaml` file automatically
6. Add environment variables in the Render dashboard:
   - `GEMINI_API_KEY`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` (paste the entire JSON from your service account file)
   - `ALLOWED_ORIGINS` (your Vercel frontend URL)

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) and import the project.

Set these environment variables in Vercel dashboard:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_API_URL` (your Render backend URL)

---

## API Reference

### POST `/scan-url`
Analyze a URL for threats.
```json
{ "url": "https://gcash-secure-login.xyz", "user_id": "optional-uid" }
```

### POST `/scan-image`
Analyze a screenshot (multipart/form-data).
- `file`: image file (PNG/JPG/WEBP, max 10MB)
- `user_id`: optional user UID

### POST `/scan-qr`
Decode QR code and analyze the URL.
- `file`: image file containing QR code
- `user_id`: optional user UID

### POST `/report-website`
Submit a website report.
```json
{ "url": "...", "reason": "Phishing", "description": "...", "userId": "..." }
```

### GET `/history?user_id={uid}`
Get user's scan history.

### GET `/dashboard-stats?user_id={uid}`
Get user's threat analytics stats.

---

### AI Response Format

All scan endpoints return:
```json
{
  "risk_level": "dangerous",
  "risk_score": 94,
  "confidence": 97,
  "summary": "This URL impersonates GCash Philippines...",
  "reasons": [
    "Brand impersonation: GCash keyword in suspicious domain",
    "Suspicious TLD: .xyz associated with low-cost phishing domains",
    "Domain registered 3 days ago"
  ],
  "recommendation": "Do NOT proceed. This is a phishing site designed to steal your GCash credentials.",
  "url": "https://gcash-secure-login.xyz",
  "scan_type": "url"
}
```

---

## Environment Variables

### Frontend (`.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

### Backend (`.env`)
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account JSON |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase service account JSON (inline) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

---

## License

MIT — Built with ❤️ for cybersecurity awareness.
