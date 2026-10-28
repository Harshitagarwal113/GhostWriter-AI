import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration for Ghostwriter AI Backend.
    Secrets and model configuration are loaded from environment variables or .env.
    """
    # Google AI Studio / Gemini API credentials
    gemini_api_key: Optional[str] = None

    # Configurable Gemma model ID accessible via Google Gemini API
    # Verified options: 'gemma-4-26b-a4b-it', 'gemma-4-31b-it'
    gemma_model_id: str = "gemma-4-26b-a4b-it"

    # Frontend CORS Origin
    frontend_origin: str = "http://localhost:5173"

    # Environment
    environment: str = "development"

    # API Routing
    api_prefix: str = "/api"

    # Scene Budgets per length choice
    max_turns_short: int = 4
    max_turns_medium: int = 7
    max_turns_long: int = 10

    # Upstream Request Timeout
    request_timeout_seconds: float = 60.0

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def is_model_configured(self) -> bool:
        """Returns True if a non-empty Gemini API key is configured."""
        return bool(self.gemini_api_key and self.gemini_api_key.strip())

    def get_max_scenes(self, story_length: str) -> int:
        if story_length == "Short":
            return self.max_turns_short
        if story_length == "Long":
            return self.max_turns_long
        return self.max_turns_medium


settings = Settings()
