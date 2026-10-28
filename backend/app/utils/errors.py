from typing import Optional


class GhostwriterError(Exception):
    """Base exception for all Ghostwriter AI backend errors."""
    def __init__(self, message: str, status_code: int = 500, details: Optional[object] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class StoryNotFoundError(GhostwriterError):
    def __init__(self, story_id: str):
        super().__init__(
            message=f"Story session '{story_id}' was not found or has expired. Start a new story.",
            status_code=404,
        )


class InvalidChoiceError(GhostwriterError):
    def __init__(self, choice_id: str, valid_choices: list):
        valid_ids = [c.get("id") if isinstance(c, dict) else getattr(c, "id", str(c)) for c in valid_choices]
        super().__init__(
            message=f"Choice '{choice_id}' is not a valid path for this scene. Expected one of: {valid_ids}",
            status_code=400,
        )


class ModelNotConfiguredError(GhostwriterError):
    def __init__(self, message: Optional[str] = None):
        msg = message or (
            "Gemma model inference is not configured. Please set the GEMINI_API_KEY environment variable "
            "with a valid Google AI Studio key."
        )
        super().__init__(message=msg, status_code=503)


class ModelInferenceError(GhostwriterError):
    def __init__(self, message: str, details: Optional[object] = None):
        super().__init__(
            message=f"Horror story generation failed: {message}",
            status_code=502,
            details=details,
        )
