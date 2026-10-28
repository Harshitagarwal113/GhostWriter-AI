import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.schemas.story import StoryStartRequest


@dataclass
class StorySession:
    story_id: str
    title: str
    setting: str
    horror_level: str
    story_length: str
    protagonist_name: str
    max_scenes: int
    current_scene_number: int
    current_narrative: str
    current_choices: List[Dict[str, Any]]
    memory: Dict[str, Any]
    history: List[Dict[str, Any]] = field(default_factory=list)
    is_ending: bool = False
    ending: Optional[Dict[str, Any]] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def add_history_entry(self, scene_number: int, narrative: str, action: Optional[str] = None):
        self.history.append({
            "scene_number": scene_number,
            "narrative": narrative,
            "action": action or "Entered the darkness",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    def get_choice_by_id(self, choice_id: str) -> Optional[Dict[str, Any]]:
        for c in self.current_choices:
            if c.get("id") == choice_id:
                return c
        return None


class StorySessionManager:
    """
    In-memory session manager for active story progressions.
    Designed with a clean interface so persistent storage (e.g. SQLite / Redis)
    can be plugged in without changing higher-level consumers.
    """

    def __init__(self):
        self._sessions: Dict[str, StorySession] = {}

    def create_session(
        self,
        req: StoryStartRequest,
        max_scenes: int,
        title: str,
        narrative: str,
        choices: List[Dict[str, Any]],
        memory: Dict[str, Any],
        is_ending: bool = False,
        ending: Optional[Dict[str, Any]] = None,
    ) -> StorySession:
        story_id = str(uuid.uuid4())
        session = StorySession(
            story_id=story_id,
            title=title,
            setting=req.setting,
            horror_level=req.horror_level,
            story_length=req.story_length,
            protagonist_name=req.protagonist_name or "The Wanderer",
            max_scenes=max_scenes,
            current_scene_number=1,
            current_narrative=narrative,
            current_choices=choices,
            memory=memory,
            is_ending=is_ending,
            ending=ending,
        )
        session.add_history_entry(1, narrative, "Arrived at threshold")
        self._sessions[story_id] = session
        return session

    def get_session(self, story_id: str) -> Optional[StorySession]:
        return self._sessions.get(story_id)

    def update_session(self, session: StorySession):
        self._sessions[session.story_id] = session

    def delete_session(self, story_id: str) -> bool:
        if story_id in self._sessions:
            del self._sessions[story_id]
            return True
        return False

    def clear(self):
        self._sessions.clear()

    def count(self) -> int:
        return len(self._sessions)


# Global singleton instance
session_manager = StorySessionManager()
