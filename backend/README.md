# Ghostwriter AI — Backend & Gemma Storytelling Engine
> *"Every Choice Leaves a Scar."*  
> Built for the DEV.to Hacktoberfest 2026 Challenge — **"Ghost in the Machine"**.

Ghostwriter AI's backend is a high-performance, asynchronous storytelling service powered by Google's open-weight **Gemma model** via the **Google Gen AI Python SDK** (`google-genai`) and the **Google Gemini API**.

---

## 🏛️ Architecture Overview

The backend is built around a decoupled, modular state and inference architecture:

```
backend/
├── app/
│   ├── main.py              # FastAPI application, CORS, and exception handlers
│   ├── config.py            # Pydantic BaseSettings configuration
│   ├── api/
│   │   ├── routes.py        # REST endpoints (/api/health, /api/story/start, /api/story/advance)
│   ├── schemas/
│   │   ├── story.py         # Type-safe Pydantic request and response schemas
│   ├── services/
│   │   ├── gemma_client.py  # Google Gen AI SDK wrapper with bounded retry & JSON parsing
│   │   ├── story_engine.py  # Story generation, choice validation, budget & endings
│   │   └── story_memory.py  # In-memory session manager with history & memory ledgers
│   ├── prompts/
│   │   └── storyteller.py   # System instructions & dynamic gothic prompt templates
│   └── utils/
│       └── errors.py        # Domain exception hierarchy (404, 400, 502, 503)
├── tests/
│   ├── test_health.py       # Health endpoint tests (configured & unconfigured)
│   ├── test_story.py        # Full mocked story lifecycle, retry logic, CORS tests
│   └── test_validation.py   # Request input validation tests
├── requirements.txt         # Pinned backend dependencies
├── .env.example             # Configuration placeholders and setup guide
└── README.md
```

---

## 🤖 Gemma Model Selection & Google AI Studio Setup

### 1. Obtain an API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **"Get API key"** and create a new key.
4. Copy the API key.

### 2. Supported Gemma Open-Weight Models
This project strictly utilizes Google's open-weight **Gemma** models through the Gemini API endpoint:
- `gemma-4-26b-a4b-it` (**Recommended Default**): Ultra-responsive, balanced latency, and rich gothic prose.
- `gemma-4-31b-it`: Maximum reasoning and atmospheric depth for sprawling horror narratives.

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` in the `backend/` directory:

```bash
cp .env.example .env
```

Populate the variables:

```ini
# Google AI Studio API Key
GEMINI_API_KEY=AIzaSyYourKeyHere...

# Open-weight Gemma model identifier
GEMMA_MODEL_ID=gemma-4-26b-a4b-it

# Allowed frontend origin for CORS
FRONTEND_ORIGIN=http://localhost:5173

# Environment
ENVIRONMENT=development
```

> **Security Note:** Secrets are never committed to version control, logged to standard output, or returned in API responses.

---

## 🚀 Running the Backend

### 1. Create and Activate Virtual Environment
```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Launch Development Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The service will be accessible at:
- **API Base:** `http://localhost:8000/api`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`

---

## 📡 API Contract Reference

### 1. Health Check
`GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "model": "gemma-4-26b-a4b-it",
  "model_configured": true,
  "environment": "development"
}
```

### 2. Start Story
`POST /api/story/start`

**Request:**
```json
{
  "setting": "Haunted Mansion",
  "horror_level": "Psychological",
  "story_length": "Medium",
  "protagonist_name": "Eleanor"
}
```

**Response:**
```json
{
  "story_id": "7f09f0ea-7359-4a4a-b5e1-a20c3a6bebe4",
  "title": "The Whispering Foyer",
  "scene_number": 1,
  "narrative": "The iron gates clang shut behind Eleanor...",
  "choices": [
    { "id": "choice_1", "text": "Ascend the spiraling staircase into darkness", "risk_level": "high" },
    { "id": "choice_2", "text": "Examine the portrait weeping black oil", "risk_level": "moderate" },
    { "id": "choice_3", "text": "Search the parlor doors for a heavy bolt", "risk_level": "low" }
  ],
  "memory": {
    "decisions": ["Crossed the iron threshold"],
    "clues": ["Rusted iron keyring"],
    "characters": ["The Weeping Countess in the portrait"],
    "scars_or_state": ["Nerves strained by the iron gate's slam"],
    "location": "Grand Foyer",
    "unresolved_mysteries": ["Whose voice is calling from the floorboards?"]
  },
  "is_ending": false,
  "ending": null
}
```

### 3. Advance Story
`POST /api/story/advance`

**Request with Predefined Choice:**
```json
{
  "story_id": "7f09f0ea-7359-4a4a-b5e1-a20c3a6bebe4",
  "choice_id": "choice_1",
  "custom_action": null
}
```

**Request with Custom Player Action:**
```json
{
  "story_id": "7f09f0ea-7359-4a4a-b5e1-a20c3a6bebe4",
  "choice_id": null,
  "custom_action": "Strike a sulphur match to inspect the scratching sound behind the wallpaper."
}
```

**Climax / Ending Response:**
```json
{
  "story_id": "7f09f0ea-7359-4a4a-b5e1-a20c3a6bebe4",
  "title": "The Whispering Foyer",
  "scene_number": 7,
  "narrative": "The walls dissolve into swirling ash...",
  "choices": [],
  "memory": { ... },
  "is_ending": true,
  "ending": {
    "title": "The Hollow Survivor",
    "ending_type": "Survival with a cost",
    "summary": "Eleanor escaped the mansion's physical grasp, but surrendered her true reflection to the dark.",
    "final_narrative": "She breathes the cold morning air, but her skin remains stone cold.",
    "unresolved_mysteries": ["The reflection remains in the mansion."]
  }
}
```

---

## 🧪 Automated Test Suite

Run all unit and integration tests:

```bash
pytest backend/tests -v
```

All 13 test suites execute with mocked model inference, verifying:
- Health reporting for configured & unconfigured instances
- Strict Pydantic input validation
- Story initialization and state creation
- Path-based choice advancement
- Custom unscripted player action resolution
- Invalid story ID (404) and invalid choice ID (400) handling
- Bounded single-retry recovery for JSON syntax anomalies
- CORS preflight behavior
