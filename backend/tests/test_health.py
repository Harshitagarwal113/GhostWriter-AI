from fastapi.testclient import TestClient
from app.main import app
from app.config import Settings
from app.api.routes import get_settings

client = TestClient(app)


def test_health_unconfigured():
    # Override settings with empty key
    unconfigured_settings = Settings(
        gemini_api_key="",
        gemma_model_id="gemma-4-26b-a4b-it",
        environment="test",
    )
    app.dependency_overrides[get_settings] = lambda: unconfigured_settings

    try:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["model_configured"] is False
        assert data["model"] == "gemma-4-26b-a4b-it"
        assert "key" not in data
        assert "secret" not in data
    finally:
        app.dependency_overrides.clear()


def test_health_configured():
    # Override settings with dummy key
    configured_settings = Settings(
        gemini_api_key="test_dummy_key_12345",
        gemma_model_id="gemma-4-26b-a4b-it",
        environment="test",
    )
    app.dependency_overrides[get_settings] = lambda: configured_settings

    try:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["model_configured"] is True
        assert data["model"] == "gemma-4-26b-a4b-it"
        # Ensure secret is NEVER in response
        assert "test_dummy_key_12345" not in response.text
    finally:
        app.dependency_overrides.clear()
