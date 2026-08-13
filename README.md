# 🛡️ TravelShield: Multilingual Trustworthy Travel Assistant

TravelShield is an AI-powered travel assistant designed for the **SIH Ideathon 2026**. It solves a critical problem with modern Generative AI: **hallucinations**. 

Instead of relying on an LLM to guess opening hours, travel distances, or ticket prices, TravelShield uses a **Deterministic Planner Engine** coupled with a **Trust Validation Gate** to ensure that every single fact presented to the user is 100% verified and traceable.

## ✨ Key Features

- **Zero-Hallucination Architecture**: The LLM is strictly constrained to a read-only role. It generates narrative text, but it is explicitly forbidden from inventing facts.
- **Trust Badges & Provenance**: Every itinerary item is tagged with a dynamic Trust Badge (🟢 VERIFIED, 🟡 COMMUNITY, ⚠️ DISPUTED). If a fact is disputed by user feedback, it is automatically downgraded across the system.
- **Geospatial Deterministic Routing**: Uses PostGIS and OpenRouteService to calculate real-world travel times, distances, and capacity constraints before ever passing data to the LLM.
- **Multilingual Support**: Fully localized in English, Hindi, and Odia.
- **Glassmorphism UI**: A beautiful, modern, and highly responsive user interface.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Glassmorphism design system)
- **i18n**: `react-i18next` for seamless language switching (en, hi, or)

### Backend
- **Framework**: Node.js + Express
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL + PostGIS for spatial queries)
- **Validation**: Zod (Runtime type safety & environment validation)
- **AI/LLM**: Google Gemini (via `@google/genai`)
- **Live APIs**: OpenRouteService (Travel matrices), Open-Meteo (Weather)

## 🏗️ Architecture: The Trust Validation Gate

1. **NLU Extraction**: The user provides a natural language prompt (e.g., "I want a relaxed history trip"). The system extracts rigid preferences (Pace: RELAXED, Accessibility: true).
2. **Deterministic Planner**: The backend engine strictly queries PostGIS for candidates matching the preferences, filters them by capacity constraints, and assigns scheduled slots using real-world travel times.
3. **LLM Narration**: A narrative summary is generated, but the LLM is **forced** to append citation IDs `[fact:123]`.
4. **Validation Gate**: The backend intercepts the LLM output, strips any hallucinated claims that lack a valid ID, and passes the clean payload to the frontend.

## 🚀 Running Locally

### Prerequisites
- Node.js (v24+)
- Supabase account & project

### 1. Database Setup
Run the SQL migrations located in `backend/prisma/schema.prisma` against your Supabase project.

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
ORS_API_KEY=your_openrouteservice_key
```

### 3. Start the Backend
```bash
cd backend
npm install
npm run dev
```
*(The backend will run on http://localhost:3001)*

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*(The frontend will run on http://localhost:5173)*

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
*Built for SIH 2026*
