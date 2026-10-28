from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_start_story_validation_invalid_setting():
    payload = {
        "setting": "Underwater Submarine",  # Not a valid setting
        "horror_level": "Psychological",
        "story_length": "Short",
        "protagonist_name": "Dr. Miller",
    }
    response = client.post("/api/story/start", json=payload)
    assert response.status_code == 422
    assert "setting" in response.text


def test_start_story_validation_invalid_horror_level():
    payload = {
        "setting": "Haunted Mansion",
        "horror_level": "Mildly_Spooky",  # Invalid
        "story_length": "Short",
        "protagonist_name": "Eleanor",
    }
    response = client.post("/api/story/start", json=payload)
    assert response.status_code == 422
    assert "horror_level" in response.text


def test_start_story_validation_invalid_length():
    payload = {
        "setting": "Haunted Mansion",
        "horror_level": "Psychological",
        "story_length": "Infinite",  # Invalid
    }
    response = client.post("/api/story/start", json=payload)
    assert response.status_code == 422


def test_advance_story_validation_missing_action():
    # Neither choice_id nor custom_action provided
    payload = {
        "story_id": "fake-story-id",
        "choice_id": None,
        "custom_action": None,
    }
    response = client.post("/api/story/advance", json=payload)
    assert response.status_code == 422
    assert "Either 'choice_id' or 'custom_action' must be provided" in response.text


def test_advance_story_validation_empty_action_strings():
    payload = {
        "story_id": "fake-story-id",
        "choice_id": "   ",
        "custom_action": "",
    }
    response = client.post("/api/story/advance", json=payload)
    assert response.status_code == 422
