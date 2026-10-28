from typing import List, Literal, Optional
from pydantic import BaseModel, Field, model_validator

SettingChoice = Literal[
    "Haunted Mansion",
    "Abandoned Hospital",
    "Cursed Village",
    "Forgotten Asylum",
    "Dark Forest",
]

HorrorLevel = Literal["Psychological", "Supernatural", "Nightmare"]

StoryLength = Literal["Short", "Medium", "Long"]


class StoryStartRequest(BaseModel):
    setting: SettingChoice
    horror_level: HorrorLevel
    story_length: StoryLength
    protagonist_name: Optional[str] = Field(
        default="The Wanderer",
        max_length=60,
        description="Name of the protagonist. Defaults to 'The Wanderer'.",
    )


class StoryAdvanceRequest(BaseModel):
    story_id: str = Field(..., min_length=1, max_length=100)
    choice_id: Optional[str] = Field(default=None, max_length=100)
    custom_action: Optional[str] = Field(default=None, max_length=300)

    @model_validator(mode="after")
    def validate_action(self) -> "StoryAdvanceRequest":
        has_choice = bool(self.choice_id and self.choice_id.strip())
        has_custom = bool(self.custom_action and self.custom_action.strip())

        if not has_choice and not has_custom:
            raise ValueError("Either 'choice_id' or 'custom_action' must be provided.")
        return self


class StoryChoiceSchema(BaseModel):
    id: str = Field(..., description="Unique choice identifier")
    text: str = Field(..., description="Descriptive narrative action")
    risk_level: Optional[str] = Field(
        default="moderate",
        description="Atmospheric threat cue (e.g. low, moderate, high, fatal)",
    )


class StoryMemorySchema(BaseModel):
    decisions: List[str] = Field(default_factory=list, description="Historical player choices")
    clues: List[str] = Field(default_factory=list, description="Discovered objects and notes")
    characters: List[str] = Field(default_factory=list, description="Encountered personas or entities")
    scars_or_state: List[str] = Field(
        default_factory=list,
        description="Psychological wounds, curses, physical marks",
    )
    location: Optional[str] = Field(default="", description="Current specific chamber or area")
    unresolved_mysteries: List[str] = Field(
        default_factory=list,
        description="Unexplained questions or foreboding omens",
    )
    protagonist: Optional[str] = Field(default=None, description="Active protagonist name")
    setting: Optional[str] = Field(default=None, description="Active domain setting")


class StoryEndingSchema(BaseModel):
    title: str = Field(..., description="Eerie conclusion title")
    ending_type: str = Field(
        ...,
        description="Category of fate (e.g. Escape, Survival with a cost, Tragic, Supernatural Revelation, Hidden Ending)",
    )
    summary: str = Field(..., description="Concise reflection on choices and fate")
    final_narrative: str = Field(..., description="Concluding literary passage")
    unresolved_mysteries: List[str] = Field(
        default_factory=list,
        description="Residual enigmas that the dark retains",
    )


class SceneResponse(BaseModel):
    story_id: str
    title: str
    scene_number: int
    narrative: str
    choices: List[StoryChoiceSchema] = Field(default_factory=list)
    memory: StoryMemorySchema
    is_ending: bool
    ending: Optional[StoryEndingSchema] = None


class HealthResponse(BaseModel):
    status: str
    model: str
    model_configured: bool
    environment: str
