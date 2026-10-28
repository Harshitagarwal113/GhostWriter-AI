import logging
from typing import Any, Dict, List, Optional

from app.config import settings
from app.prompts.storyteller import build_advance_prompt, build_init_prompt
from app.schemas.story import (
    SceneResponse,
    StoryAdvanceRequest,
    StoryChoiceSchema,
    StoryEndingSchema,
    StoryMemorySchema,
    StoryStartRequest,
)
from app.services.gemma_client import GemmaStoryClient, gemma_client
from app.services.story_memory import StorySessionManager, session_manager
from app.utils.errors import InvalidChoiceError, StoryNotFoundError

logger = logging.getLogger("ghostwriter.engine")


class StoryEngine:
    """
    Central orchestration engine managing story progression, Gemma AI prompts,
    choice validation, memory accumulation, and endings.
    """

    def __init__(
        self,
        client: Optional[GemmaStoryClient] = None,
        memory_mgr: Optional[StorySessionManager] = None,
    ):
        self.client = client or gemma_client
        self.memory_mgr = memory_mgr or session_manager

    def _normalize_choices(self, raw_choices: List[Any]) -> List[StoryChoiceSchema]:
        normalized: List[StoryChoiceSchema] = []
        for idx, item in enumerate(raw_choices):
            if isinstance(item, dict):
                c_id = str(item.get("id") or f"choice_{idx + 1}")
                c_text = str(item.get("text") or "").strip()
                c_risk = str(item.get("risk_level") or "moderate")
                if c_text:
                    normalized.append(StoryChoiceSchema(id=c_id, text=c_text, risk_level=c_risk))
            elif isinstance(item, str) and item.strip():
                normalized.append(
                    StoryChoiceSchema(id=f"choice_{idx + 1}", text=item.strip(), risk_level="moderate")
                )
        return normalized

    def _normalize_memory(
        self,
        raw_memory: Dict[str, Any],
        protagonist: Optional[str] = None,
        setting: Optional[str] = None,
    ) -> StoryMemorySchema:
        return StoryMemorySchema(
            decisions=list(raw_memory.get("decisions") or []),
            clues=list(raw_memory.get("clues") or []),
            characters=list(raw_memory.get("characters") or []),
            scars_or_state=list(raw_memory.get("scars_or_state") or []),
            location=str(raw_memory.get("location") or ""),
            unresolved_mysteries=list(raw_memory.get("unresolved_mysteries") or []),
            protagonist=str(raw_memory.get("protagonist") or protagonist or "The Wanderer"),
            setting=str(raw_memory.get("setting") or setting or "Unknown Realm"),
        )

    def _normalize_ending(self, raw_ending: Optional[Dict[str, Any]]) -> Optional[StoryEndingSchema]:
        if not raw_ending or not isinstance(raw_ending, dict):
            return None
        return StoryEndingSchema(
            title=str(raw_ending.get("title") or "The Silent Grave"),
            ending_type=str(raw_ending.get("ending_type") or "Survival with a cost"),
            summary=str(raw_ending.get("summary") or "The chronicle ends."),
            final_narrative=str(raw_ending.get("final_narrative") or ""),
            unresolved_mysteries=list(raw_ending.get("unresolved_mysteries") or []),
        )

    async def start_story(self, req: StoryStartRequest) -> SceneResponse:
        """
        Initializes a brand new gothic horror story session with Gemma.
        """
        max_scenes = settings.get_max_scenes(req.story_length)
        prompt = build_init_prompt(req)

        # Call Gemma client
        result = await self.client.generate_turn(prompt)

        title = result.get("title") or f"{req.setting} Chronicle"
        narrative = result.get("narrative") or "You stand before the dark threshold..."
        raw_choices = result.get("choices") or []
        choices_schemas = self._normalize_choices(raw_choices)
        memory_schema = self._normalize_memory(
            result.get("memory") or {},
            protagonist=req.protagonist_name,
            setting=req.setting,
        )
        is_ending = bool(result.get("is_ending", False))
        ending_schema = self._normalize_ending(result.get("ending"))

        # Save session in memory manager
        choices_dicts = [c.model_dump() for c in choices_schemas]
        memory_dict = memory_schema.model_dump()
        ending_dict = ending_schema.model_dump() if ending_schema else None

        session = self.memory_mgr.create_session(
            req=req,
            max_scenes=max_scenes,
            title=title,
            narrative=narrative,
            choices=choices_dicts,
            memory=memory_dict,
            is_ending=is_ending,
            ending=ending_dict,
        )

        return SceneResponse(
            story_id=session.story_id,
            title=session.title,
            scene_number=1,
            narrative=narrative,
            choices=choices_schemas,
            memory=memory_schema,
            is_ending=is_ending,
            ending=ending_schema,
        )

    async def advance_story(self, req: StoryAdvanceRequest) -> SceneResponse:
        """
        Advances an active story session by incorporating either a chosen path or custom action.
        """
        session = self.memory_mgr.get_session(req.story_id)
        if not session:
            raise StoryNotFoundError(req.story_id)

        # If already concluded, return cached final state
        if session.is_ending:
            return SceneResponse(
                story_id=session.story_id,
                title=session.title,
                scene_number=session.current_scene_number,
                narrative=session.current_narrative,
                choices=[StoryChoiceSchema(**c) for c in session.current_choices],
                memory=StoryMemorySchema(**session.memory),
                is_ending=True,
                ending=StoryEndingSchema(**session.ending) if session.ending else None,
            )

        # Determine action text
        if req.choice_id:
            choice_match = session.get_choice_by_id(req.choice_id)
            if not choice_match:
                raise InvalidChoiceError(req.choice_id, session.current_choices)
            action_text = choice_match.get("text", req.choice_id)
        elif req.custom_action:
            action_text = req.custom_action.strip()
        else:
            raise ValueError("No action specified.")

        next_scene_number = session.current_scene_number + 1

        prompt = build_advance_prompt(
            title=session.title,
            setting=session.setting,
            horror_level=session.horror_level,
            protagonist=session.protagonist_name,
            scene_number=next_scene_number,
            max_scenes=session.max_scenes,
            action_taken=action_text,
            previous_narrative=session.current_narrative,
            memory=session.memory,
            recent_history=session.history,
        )

        # Call Gemma client
        result = await self.client.generate_turn(prompt)

        narrative = result.get("narrative") or "The silence deepens around your decision..."
        is_ending = bool(result.get("is_ending", False))

        # Enforce end of story if reached budget
        if next_scene_number >= session.max_scenes:
            is_ending = True

        raw_choices = [] if is_ending else (result.get("choices") or [])
        choices_schemas = self._normalize_choices(raw_choices)
        memory_schema = self._normalize_memory(
            result.get("memory") or {},
            protagonist=session.protagonist_name,
            setting=session.setting,
        )

        # Ensure decision recorded in memory
        if action_text not in memory_schema.decisions:
            memory_schema.decisions.append(f"Scene {next_scene_number}: {action_text}")

        ending_schema = None
        if is_ending:
            raw_ending = result.get("ending") or {}
            raw_ending.setdefault("title", "The Inevitable Conclusion")
            raw_ending.setdefault("ending_type", "Survival with a cost")
            raw_ending.setdefault(
                "summary",
                f"You traversed {next_scene_number} scenes in the {session.setting}.",
            )
            raw_ending.setdefault("final_narrative", narrative)
            ending_schema = self._normalize_ending(raw_ending)

        # Update session state
        choices_dicts = [c.model_dump() for c in choices_schemas]
        memory_dict = memory_schema.model_dump()
        ending_dict = ending_schema.model_dump() if ending_schema else None

        session.current_scene_number = next_scene_number
        session.current_narrative = narrative
        session.current_choices = choices_dicts
        session.memory = memory_dict
        session.is_ending = is_ending
        session.ending = ending_dict
        session.add_history_entry(next_scene_number, narrative, action_text)
        self.memory_mgr.update_session(session)

        return SceneResponse(
            story_id=session.story_id,
            title=session.title,
            scene_number=next_scene_number,
            narrative=narrative,
            choices=choices_schemas,
            memory=memory_schema,
            is_ending=is_ending,
            ending=ending_schema,
        )


story_engine = StoryEngine()
