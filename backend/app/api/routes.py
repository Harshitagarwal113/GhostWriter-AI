from fastapi import APIRouter, Depends
from app.config import Settings, settings
from app.schemas.story import (
    HealthResponse,
    SceneResponse,
    StoryAdvanceRequest,
    StoryStartRequest,
)
from app.services.story_engine import StoryEngine, story_engine

router = APIRouter()


def get_engine() -> StoryEngine:
    return story_engine


def get_settings() -> Settings:
    return settings


@router.get("/health", response_model=HealthResponse)
async def health_check(current_settings: Settings = Depends(get_settings)):
    """
    Health check endpoint reporting API status and Gemma model readiness.
    Never exposes API keys or secrets.
    """
    return HealthResponse(
        status="healthy" if current_settings.is_model_configured else "degraded",
        model=current_settings.gemma_model_id,
        model_configured=current_settings.is_model_configured,
        environment=current_settings.environment,
    )


@router.post("/story/start", response_model=SceneResponse)
async def start_story(
    req: StoryStartRequest,
    engine: StoryEngine = Depends(get_engine),
):
    """
    Begins a new interactive gothic horror story session with Gemma.
    """
    return await engine.start_story(req)


@router.post("/story/advance", response_model=SceneResponse)
async def advance_story(
    req: StoryAdvanceRequest,
    engine: StoryEngine = Depends(get_engine),
):
    """
    Advances an active story session by selecting a choice or executing a custom action.
    """
    return await engine.advance_story(req)
