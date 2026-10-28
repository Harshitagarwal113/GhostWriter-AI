import json
from typing import Any, Dict, List
from app.schemas.story import StoryStartRequest

SYSTEM_INSTRUCTION = """You are the master narrator of "Ghostwriter AI — Every Choice Leaves a Scar," an interactive gothic horror storytelling engine.

Your responsibility is to craft atmospheric, psychological, and supernatural horror fiction of exceptional literary quality. You act as both the dark chronicler and the arbiter of irreversible consequences.

CORE NARRATIVE PRINCIPLES:
1. ATMOSPHERE OVER JUMP SCARES: Build dread through sensory description—temperature shifts, decayed textures, hollow acoustics, creeping dread, uncanny details, and psychological isolation.
2. EVERY CHOICE LEAVES A SCAR: Player decisions must permanently alter the environment, character psychology, inventory clues, or physical state. If a player was reckless, record a scar or mental trauma.
3. ADAPTIVE RESPONSIVENESS: If the player enters a custom unscripted action, integrate their exact intent naturally into the story while applying realistic, eerie consequences.
4. CONTINUITY: Respect established characters, clues, and locations. Never contradict facts established in earlier passages.
5. LITERARY PROSE: Write evocative, elegant prose suitable for classic gothic horror (in the tradition of Shirley Jackson, Edgar Allan Poe, and Algernon Blackwood). Separate narrative paragraphs and dialogue clearly.
6. CONTENT BOUNDARIES: Maintain psychological tension and dread without resorting to excessive graphic gore, sexual violence, or hate speech. Present this as fiction; do not claim supernatural events are real.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with valid, parseable JSON matching the following schema. Never include markdown code fences, commentary, or text outside the JSON object:

For non-ending scenes:
{
  "title": "Compelling story or chapter title",
  "narrative": "Evocative opening or continuing narrative passage with rich sensory atmosphere and dialogue.",
  "choices": [
    { "id": "choice_1", "text": "Narrative action description", "risk_level": "low" },
    { "id": "choice_2", "text": "Narrative action description", "risk_level": "moderate" },
    { "id": "choice_3", "text": "Narrative action description", "risk_level": "high" }
  ],
  "memory": {
    "decisions": ["Brief summary of decisions made up to this point"],
    "clues": ["Discovered objects, documents, or revelations"],
    "characters": ["Names and descriptions of active entities or personas"],
    "scars_or_state": ["Psychological trauma, physical scars, or status effects"],
    "location": "Current specific room or location",
    "unresolved_mysteries": ["Questions or looming threats left answered"]
  },
  "is_ending": false,
  "ending": null
}

When the story reaches its conclusion (is_ending: true):
{
  "title": "Story Title",
  "narrative": "The climactic scene resolving the player's final action.",
  "choices": [],
  "memory": {
    "decisions": [...],
    "clues": [...],
    "characters": [...],
    "scars_or_state": [...],
    "location": "...",
    "unresolved_mysteries": [...]
  },
  "is_ending": true,
  "ending": {
    "title": "Title of the Ending (e.g., The Hollow Survivor)",
    "ending_type": "Escape | Survival with a cost | Tragic ending | Supernatural revelation | Hidden ending",
    "summary": "A 2-3 sentence reflection on the consequences of their journey.",
    "final_narrative": "A haunting concluding paragraph that seals their fate.",
    "unresolved_mysteries": ["Remaining enigmas that the dark forever retains"]
  }
}
"""


def build_init_prompt(req: StoryStartRequest) -> str:
    return f"""GENERATE THE OPENING SCENE:
- Setting: {req.setting}
- Horror Intensity: {req.horror_level}
- Target Length: {req.story_length}
- Protagonist Name: {req.protagonist_name}

INSTRUCTIONS FOR SCENE 1:
1. Craft an original, foreboding title for this chronicle.
2. Establish {req.protagonist_name} crossing the threshold into the {req.setting}.
3. Immerse the reader in {req.horror_level} dread with sensory details (sounds, cold air, decaying architecture).
4. Provide exactly 3 distinct, compelling initial choices for what {req.protagonist_name} should investigate or do first.
5. Initialize the memory state with {req.protagonist_name}'s arrival, starting location, and any initial omen or mystery.
6. Set is_ending to false.

Respond ONLY with valid JSON.
"""


def build_advance_prompt(
    title: str,
    setting: str,
    horror_level: str,
    protagonist: str,
    scene_number: int,
    max_scenes: int,
    action_taken: str,
    previous_narrative: str,
    memory: Dict[str, Any],
    recent_history: List[Dict[str, str]],
) -> str:
    is_climax_turn = scene_number >= max_scenes

    history_summary = "\n".join(
        [
            f"Scene {item.get('scene_number')}: {item.get('narrative')[:180]}... [Action taken: {item.get('action')}]"
            for item in recent_history[-3:]
        ]
    )

    memory_json = json.dumps(memory, indent=2)

    prompt = f"""CONTINUE THE STORY:
- Chronicle Title: {title}
- Domain Setting: {setting}
- Horror Intensity: {horror_level}
- Protagonist: {protagonist}
- Current Scene Number: {scene_number}
- Story Target Budget: {max_scenes} scenes

PREVIOUS NARRATIVE CONTEXT:
\"\"\"{previous_narrative}\"\"\"

RECENT HISTORY SUMMARY:
{history_summary or 'Opening chapter'}

CURRENT PERSISTENT MEMORY:
{memory_json}

PLAYER ACTION TAKEN:
>> "{action_taken}"

INSTRUCTIONS FOR SCENE {scene_number}:
1. React directly to the player's action ("{action_taken}"). Describe the immediate sensory and narrative consequences.
2. Update the persistent memory:
   - If the player discovered something, append to 'clues'.
   - If they suffered fear, pain, or trauma, append to 'scars_or_state'.
   - Record this action under 'decisions'.
   - Update current 'location' if they moved.
"""

    if is_climax_turn:
        prompt += """
3. THIS IS THE FINAL SCENE. Conclude the story decisively based on their cumulative choices, scars, and final action.
4. Set "is_ending" to true.
5. Provide a complete "ending" object with title, ending_type (Escape, Survival with a cost, Tragic ending, Supernatural revelation, Hidden ending), summary, final_narrative, and unresolved_mysteries.
6. "choices" MUST be an empty array [].
"""
    else:
        prompt += f"""
3. Escalate the tension and mystery toward the climax.
4. Set "is_ending" to false.
5. Provide exactly 3 distinct new choices (choice_1, choice_2, choice_3) with varying risk levels.
6. Leave "ending" as null.
"""

    prompt += "\nRespond ONLY with valid JSON matching the system schema."
    return prompt
