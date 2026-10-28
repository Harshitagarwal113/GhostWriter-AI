from unittest.mock import AsyncMock
from fastapi.testclient import TestClient

from app.api.routes import get_engine, get_settings
from app.config import Settings
from app.main import app
from app.services.gemma_client import GemmaStoryClient, clean_and_parse_json
from app.services.story_engine import StoryEngine
from app.services.story_memory import StorySessionManager

client = TestClient(app)


def test_clean_and_parse_json_variations():
    # Standard clean JSON
    raw_1 = '{"title": "Gothic Tale", "narrative": "A dark hallway looms.", "choices": [], "is_ending": false}'
    res_1 = clean_and_parse_json(raw_1)
    assert res_1["title"] == "Gothic Tale"
    assert res_1["narrative"] == "A dark hallway looms."

    # Markdown fenced code block
    raw_2 = '```json\n{"title": "Gothic Tale", "narrative": "Fences stripped.", "choices": []}\n```'
    res_2 = clean_and_parse_json(raw_2)
    assert res_2["narrative"] == "Fences stripped."

    # Leading & trailing conversational text
    raw_3 = 'Here is your horror scene:\n{"title": "Tale", "narrative": "Echoes in the dark.", "choices": []}\nEnjoy the nightmare!'
    res_3 = clean_and_parse_json(raw_3)
    assert res_3["narrative"] == "Echoes in the dark."


def test_start_story_missing_api_key():
    # If no API key configured and default client called, must raise 503
    unconfigured_settings = Settings(gemini_api_key="")
    app.dependency_overrides[get_settings] = lambda: unconfigured_settings

    # Provide an engine with unconfigured Gemma client
    engine = StoryEngine(
        client=GemmaStoryClient(api_key=""),
        memory_mgr=StorySessionManager(),
    )
    app.dependency_overrides[get_engine] = lambda: engine

    try:
        payload = {
            "setting": "Haunted Mansion",
            "horror_level": "Psychological",
            "story_length": "Short",
            "protagonist_name": "Eleanor",
        }
        response = client.post("/api/story/start", json=payload)
        assert response.status_code == 503
        assert "not configured" in response.text
    finally:
        app.dependency_overrides.clear()


def test_story_lifecycle_mocked():
    # Setup test memory manager and mock client
    test_memory = StorySessionManager()
    mock_client = AsyncMock()

    # Opening scene mock response
    mock_client.generate_turn.return_value = {
        "title": "The Whispering Foyer",
        "narrative": "The grand iron gates slam shut behind Eleanor. Cold wind howls through shattered glass.",
        "choices": [
            {"id": "choice_1", "text": "Ascend the spiraling staircase into darkness", "risk_level": "high"},
            {"id": "choice_2", "text": "Examine the portrait weeping black oil", "risk_level": "moderate"},
            {"id": "choice_3", "text": "Search the parlor doors for a heavy bolt", "risk_level": "low"},
        ],
        "memory": {
            "decisions": ["Crossed the iron threshold"],
            "clues": ["Rusted iron keyring"],
            "characters": ["The Weeping Countess in the portrait"],
            "scars_or_state": ["Nerves strained by the iron gate's slam"],
            "location": "Grand Foyer",
            "unresolved_mysteries": ["Whose voice is calling from the floorboards?"],
        },
        "is_ending": False,
        "ending": None,
    }

    test_engine = StoryEngine(client=mock_client, memory_mgr=test_memory)
    app.dependency_overrides[get_engine] = lambda: test_engine

    try:
        # 1. Start Story
        start_payload = {
            "setting": "Haunted Mansion",
            "horror_level": "Psychological",
            "story_length": "Short",
            "protagonist_name": "Eleanor",
        }
        start_resp = client.post("/api/story/start", json=start_payload)
        assert start_resp.status_code == 200
        start_data = start_resp.json()

        story_id = start_data["story_id"]
        assert start_data["title"] == "The Whispering Foyer"
        assert start_data["scene_number"] == 1
        assert len(start_data["choices"]) == 3
        assert start_data["is_ending"] is False
        assert start_data["memory"]["location"] == "Grand Foyer"

        # 2. Advance with valid choice_id
        mock_client.generate_turn.return_value = {
            "title": "The Whispering Foyer",
            "narrative": "Eleanor ascends the groaning stairs. Each tread moans like a dying breath.",
            "choices": [
                {"id": "choice_1", "text": "Enter the nursery with the ticking clock", "risk_level": "high"},
                {"id": "choice_2", "text": "Pry open the padlocked attic door", "risk_level": "high"},
                {"id": "choice_3", "text": "Hide beneath the linen bench", "risk_level": "moderate"},
            ],
            "memory": {
                "decisions": ["Crossed the iron threshold", "Ascended the staircase"],
                "clues": ["Rusted iron keyring", "Child's music box melody"],
                "characters": ["The Weeping Countess"],
                "scars_or_state": ["Bruised knee from a loose step"],
                "location": "Second Floor Gallery",
                "unresolved_mysteries": ["The clock ticks backwards"],
            },
            "is_ending": False,
            "ending": None,
        }

        advance_payload = {
            "story_id": story_id,
            "choice_id": "choice_1",
            "custom_action": None,
        }
        adv_resp = client.post("/api/story/advance", json=advance_payload)
        assert adv_resp.status_code == 200
        adv_data = adv_resp.json()
        assert adv_data["scene_number"] == 2
        assert adv_data["memory"]["location"] == "Second Floor Gallery"

        # 3. Advance with custom action
        mock_client.generate_turn.return_value = {
            "title": "The Whispering Foyer",
            "narrative": "Eleanor lights a match and reads the inscription beneath the peeling wallpaper.",
            "choices": [
                {"id": "choice_1", "text": "Flee towards the balcony", "risk_level": "high"},
                {"id": "choice_2", "text": "Speak the name out loud", "risk_level": "fatal"},
                {"id": "choice_3", "text": "Extinguish the flame and hold breath", "risk_level": "moderate"},
            ],
            "memory": {
                "decisions": ["Crossed the iron threshold", "Ascended the staircase", "Lit a match against wallpaper"],
                "clues": ["Etched sigil: 'NON REDIT'"],
                "characters": ["Shadow behind wallpaper"],
                "scars_or_state": ["Burned fingertip"],
                "location": "Corridor of Shadows",
                "unresolved_mysteries": ["What is 'NON REDIT'?"],
            },
            "is_ending": False,
            "ending": None,
        }

        custom_payload = {
            "story_id": story_id,
            "choice_id": None,
            "custom_action": "Strike a sulphur match to inspect the scratching sound behind the wallpaper.",
        }
        custom_resp = client.post("/api/story/advance", json=custom_payload)
        assert custom_resp.status_code == 200
        custom_data = custom_resp.json()
        assert custom_data["scene_number"] == 3

        # 4. Advance with invalid choice_id (must return 400)
        invalid_choice_payload = {
            "story_id": story_id,
            "choice_id": "non_existent_choice_xyz",
            "custom_action": None,
        }
        bad_choice_resp = client.post("/api/story/advance", json=invalid_choice_payload)
        assert bad_choice_resp.status_code == 400
        assert "not a valid path" in bad_choice_resp.text

        # 5. Advance with invalid story_id (must return 404)
        missing_story_payload = {
            "story_id": "00000000-0000-0000-0000-000000000000",
            "choice_id": "choice_1",
            "custom_action": None,
        }
        missing_resp = client.post("/api/story/advance", json=missing_story_payload)
        assert missing_resp.status_code == 404
        assert "not found" in missing_resp.text

        # 6. Reaching the ending scene
        mock_client.generate_turn.return_value = {
            "title": "The Whispering Foyer",
            "narrative": "The walls dissolve into swirling ash. Eleanor reaches the iron gates once more, clutching the key, but her reflection in the glass is no longer her own.",
            "choices": [],
            "memory": {
                "decisions": ["Crossed threshold", "Ascended stairs", "Read sigil", "Unlocked final grate"],
                "clues": ["Silver key", "Ashen locket"],
                "characters": [],
                "scars_or_state": ["Eyes clouded with black oil", "Permanent chill"],
                "location": "The Threshold of Fog",
                "unresolved_mysteries": ["Whose face watches from her reflection?"],
            },
            "is_ending": True,
            "ending": {
                "title": "The Hollow Survivor",
                "ending_type": "Survival with a cost",
                "summary": "Eleanor escaped the mansion's physical grasp, but surrendered her true reflection to the dark.",
                "final_narrative": "She breathes the cold morning air, but when she touches her cheek, the skin is stone cold.",
                "unresolved_mysteries": ["The reflection remains in the mansion."],
            },
        }

        ending_payload = {
            "story_id": story_id,
            "choice_id": "choice_1",
            "custom_action": None,
        }
        ending_resp = client.post("/api/story/advance", json=ending_payload)
        assert ending_resp.status_code == 200
        ending_data = ending_resp.json()
        assert ending_data["is_ending"] is True
        assert len(ending_data["choices"]) == 0
        assert ending_data["ending"] is not None
        assert ending_data["ending"]["title"] == "The Hollow Survivor"
        assert ending_data["ending"]["ending_type"] == "Survival with a cost"

    finally:
        app.dependency_overrides.clear()


import pytest
from unittest.mock import MagicMock
from app.utils.errors import ModelInferenceError


@pytest.mark.asyncio
async def test_gemma_client_bounded_retry_success():
    client_obj = GemmaStoryClient(api_key="mock_key")
    mock_genai_client = MagicMock()

    # First call returns broken JSON, second call returns valid JSON
    bad_resp = MagicMock()
    bad_resp.text = "NOT JSON"

    good_resp = MagicMock()
    good_resp.text = '{"title": "Recovered", "narrative": "Valid horror scene.", "choices": [], "is_ending": false}'

    mock_genai_client.models.generate_content.side_effect = [bad_resp, good_resp]
    client_obj._client = mock_genai_client

    result = await client_obj.generate_turn("test prompt", allow_retry=True)
    assert result["title"] == "Recovered"
    assert result["narrative"] == "Valid horror scene."
    assert mock_genai_client.models.generate_content.call_count == 2


@pytest.mark.asyncio
async def test_gemma_client_bounded_retry_failure():
    client_obj = GemmaStoryClient(api_key="mock_key")
    mock_genai_client = MagicMock()

    bad_resp = MagicMock()
    bad_resp.text = "NOT JSON"

    # Both calls return bad text
    mock_genai_client.models.generate_content.side_effect = [bad_resp, bad_resp]
    client_obj._client = mock_genai_client

    with pytest.raises(ModelInferenceError):
        await client_obj.generate_turn("test prompt", allow_retry=True)


def test_cors_preflight():
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"

