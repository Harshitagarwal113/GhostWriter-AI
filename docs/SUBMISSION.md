*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

![Ghostwriter AI - Every Choice Leaves a Scar](thumbnail.jpg)

## What I Built

**Ghostwriter AI — Every Choice Leaves a Scar** is an interactive, unscripted gothic horror storytelling generator designed to give players genuine narrative agency while confronting them with the indelible consequences of their decisions.

Traditional text adventures rely on static, pre-written decision branches: choose option A or B to jump to passage 12 or 13. Conversely, modern conversational AI chatbots often suffer from narrative amnesia, abrupt tonal drift, or cheerful assistant personas that completely dissolve suspense.

### The Interpretation of "Ghost in the Machine"
In gothic folklore, a haunting is an unresolved echo of past trauma trapped inside an environment. In **Ghostwriter AI**, the *"Ghost"* is the persistent memory ledger trapped within the machine. 

The machine does not just generate words—**it holds a grudge**. As you explore eerie domains (from the decaying halls of Blackwood Manor to abandoned sanitariums and cursed hamlets), the engine continuously tracks your discovered clues, psychological wounds, unprompted actions, and fateful decisions. Every choice leaves an irreversible scar on the narrative ledger, culminating in a climactic autopsy ending (*Escape*, *Survival with a cost*, *Tragic ending*, *Supernatural revelation*, or *Hidden ending*).

---

## Demo

- **Live Deployed App**: <!-- TODO: Insert your deployed link here (e.g. https://ghostwriter-ai.vercel.app) -->
- **Video Walkthrough**: <!-- TODO: Insert video demo URL (e.g. YouTube, Loom) -->
- **GitHub Repository**: [https://github.com/Harshitagarwal113/GhostWriter-AI](https://github.com/Harshitagarwal113/GhostWriter-AI)

### Visual Preview & Experience
The application features a dark gothic aesthetic inspired by classic horror literature:
- **Atmospheric Palette**: Near-black charcoal backgrounds (`#0a0a0c`), dynamic vignette, subtle SVG noise film grain, and restrained blood-red accents.
- **Cinematic Typography**: *Cinzel* for regal titles and headers, *EB Garamond* with dedicated dialogue styling for story passages, and *Inter* for accessible UI controls.
- **Interactive Consequence Ledger**: The collapsible *"What the darkness remembers"* panel dynamically displays clues, inventory relics, character states, and permanent scars.
- **Unscripted Agency**: Players can choose from three dynamically generated choices (with keyboard shortcuts `[1]`, `[2]`, `[3]`) or type freeform custom actions (e.g., *"Press your fingertips against the peeling wallpaper near the hearth to feel for drafts"*).

---

## Code

{% github Harshitagarwal113/GhostWriter-AI %}

Direct Repository Link: **[https://github.com/Harshitagarwal113/GhostWriter-AI](https://github.com/Harshitagarwal113/GhostWriter-AI)**

---

## How I Built It

Ghostwriter AI is built as a decoupled, high-performance full-stack web application designed for deterministic state management and zero-leak AI inference.

```
GhostWriter AI/
├── frontend/                 # React 19 + TypeScript + Tailwind CSS + Vite
│   ├── src/
│   │   ├── components/       # AtmosphericBackground, StoryChoices, DarknessLedger, etc.
│   │   ├── pages/            # LandingPage, StorySetupPage, StoryPlayerPage, EndingPage
│   │   ├── hooks/            # useStorySession, useApiHealth
│   │   ├── services/api.ts   # Centralized Fetch API client with timeouts & retry logic
│   │   └── types/story.ts    # Type-safe TypeScript contracts
├── backend/                  # Python 3.14 + FastAPI + Pydantic v2 + google-genai
│   ├── app/
│   │   ├── api/routes.py     # /api/health, /api/story/start, /api/story/advance
│   │   ├── services/         # gemma_client.py, story_engine.py, story_memory.py
│   │   ├── prompts/          # storyteller.py (gothic system instructions & templates)
│   │   └── main.py           # FastAPI server with CORS & error handlers
│   └── tests/                # 13 automated Pytest unit and integration tests
└── README.md
```

### The AI Engine: Google's Open-Weight Gemma Model
- **Model**: Google's open-weight **Gemma model** (`gemma-4-26b-a4b-it` default, `gemma-4-31b-it` high-reasoning alternative).
- **Integration**: Implemented through Google's official **Gen AI Python SDK** (`google-genai`) and the Gemini API delivery endpoint.
- **Bounded Retry & JSON Sanitation**: Language models can occasionally emit markdown code fences or non-JSON preamble. Our `gemma_client.py` strips fences, isolates JSON object boundaries, and executes a bounded single-retry fallback to guarantee valid structured schemas without redundant token consumption.
- **Pacing Engine**: To prevent open-ended AI rambling, story length budgets (Short: 3–4 scenes, Medium: 5–7 scenes, Long: 8–10 scenes) guide Gemma from escalating tension directly into a fateful climax.
- **Automated Test Suite**: 13 automated unit tests cover health reporting, Pydantic input validation, mocked story progression, custom action resolution, and CORS preflight.

---

## Why Does Open Innovation Matter?

Open innovation and open-weight models like **Gemma** are transformative for interactive fiction and creative AI development:

1. **Transparency & Auditable Alignment**: Unlike proprietary black-box APIs whose system prompts, tokenizers, and alignment penalties can change without notice, open-weight models give developers full insight into model behavior, allowing creators to craft precise narrative systems with confidence.
2. **Creative Literary Expression Without Sanitization**: Horror fiction relies on psychological tension, dread, and eerie themes. Closed commercial models often over-censor atmospheric horror prompts into bland cheerful statements. Open models respect literary nuance while keeping safety boundaries intact.
3. **Reproducibility & Longevity**: An interactive story built on open standards won't break if a vendor deprecates a proprietary endpoint. Developers can run open weights locally, fine-tune them on gothic literature corpora, or deploy them through hosted APIs.

---

## My Agent Session

This application was developed, tested, and integrated with the assistance of agentic pair-programming workflows:

```
Conversation ID: acff272d-74b8-48dc-9bf7-171b332d47c4
Tooling: DevRelay Gateway, Google Gen AI Python SDK, Browser Subagent Verification
```

---

## The Spirit of It

During our live test of the *Haunted Mansion* scenario, the protagonist Eleanor encountered a weeping portrait over an ancient hearth. Instead of taking a pre-generated choice, we tested the custom action input:

> **Player Action**: *"Press your fingertips against the peeling wallpaper near the hearth to feel for drafts."*

Gemma didn't give a canned response. It adapted to her exact touch:

> *"Eleanor's fingers brush against the desiccated, floral patterns of the wallpaper... beneath the layer of decay, her touch finds the unmistakable, sharp edge of a recessed latch, cold as a tombstone. A hollow, rhythmic tremor shudders through the wall—vibrating like a biological pulse."*

When she manipulated the latch in the final scene, the climax landed with true chills:

> *"There is a wet, sickening sound—the sound of a suture tearing through muscle. The wall does not swing on hinges; it peels back like a heavy, weeping eyelid... Eleanor discovers that Blackwood Manor is not a house, but a predatory, sentient organism."*

The memory ledger immediately updated her status to **"Sensory assimilation"** and **"Fatal entrapment"**, sealing her fate in *"The Eternal Pulse"* ending. That was the moment the project truly came alive: the machine wasn't just predicting the next token—it was remembering her curiosity and turning it into her undoing.

---

## Prize Categories

- **Hacktoberfest Open-Source AI Challenge Week 4: "Ghost in the Machine"**
