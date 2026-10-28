import json
import logging
import re
from typing import Any, Dict, Optional
from google import genai
from google.genai import types

from app.config import settings
from app.prompts.storyteller import SYSTEM_INSTRUCTION
from app.utils.errors import ModelInferenceError, ModelNotConfiguredError

logger = logging.getLogger("ghostwriter.gemma")


def clean_and_parse_json(raw_text: str) -> Dict[str, Any]:
    """
    Cleans raw text output from the language model and parses it into a Python dictionary.
    Handles markdown code fences, surrounding whitespace, and edge-case wrappers.
    """
    if not raw_text or not raw_text.strip():
        raise ValueError("Model returned an empty response.")

    text = raw_text.strip()

    # Strip markdown code blocks ```json ... ``` or ``` ... ```
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
        text = text.strip()

    # Find boundaries of the primary JSON object if wrapped in explanatory text
    start_idx = text.find("{")
    end_idx = text.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx : end_idx + 1]

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Malformed JSON payload from model: {exc}") from exc

    if not isinstance(data, dict):
        raise ValueError(f"Expected JSON object, got {type(data).__name__}")

    # Ensure critical fields exist
    if "narrative" not in data or not str(data["narrative"]).strip():
        raise ValueError("Model response is missing required 'narrative' field.")

    # Normalize defaults
    data.setdefault("title", "The Unnamed Horror")
    data.setdefault("is_ending", False)
    data.setdefault("choices", [])
    data.setdefault("ending", None)

    # Ensure memory structure exists
    if "memory" not in data or not isinstance(data["memory"], dict):
        data["memory"] = {
            "decisions": [],
            "clues": [],
            "characters": [],
            "scars_or_state": [],
            "location": "",
            "unresolved_mysteries": [],
        }
    else:
        mem = data["memory"]
        mem.setdefault("decisions", [])
        mem.setdefault("clues", [])
        mem.setdefault("characters", [])
        mem.setdefault("scars_or_state", [])
        mem.setdefault("location", "")
        mem.setdefault("unresolved_mysteries", [])

    return data


class GemmaStoryClient:
    """
    Dedicated client for generating structured horror narrative turns via Google Gemma
    through the official Google Gen AI Python SDK.
    """

    def __init__(self, api_key: Optional[str] = None, model_id: Optional[str] = None):
        self.api_key = api_key if api_key is not None else settings.gemini_api_key
        self.model_id = model_id or settings.gemma_model_id
        self._client: Optional[genai.Client] = None

    def get_client(self) -> genai.Client:
        if not self.api_key or not self.api_key.strip():
            raise ModelNotConfiguredError()
        if self._client is None:
            self._client = genai.Client(api_key=self.api_key.strip())
        return self._client

    async def generate_turn(
        self,
        prompt: str,
        allow_retry: bool = True,
    ) -> Dict[str, Any]:
        """
        Executes generation against the configured Gemma model and returns parsed, validated JSON.
        Implements bounded single-retry logic for JSON formatting anomalies.
        """
        client = self.get_client()

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.85,
            top_p=0.92,
        )

        try:
            # Generate content using configured Gemma model
            response = client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=config,
            )

            raw_text = response.text or ""
            return clean_and_parse_json(raw_text)

        except Exception as err:
            logger.warning(f"Initial generation attempt failed: {err}")

            if allow_retry:
                logger.info("Attempting bounded retry with strict JSON reinforcement...")
                retry_prompt = (
                    f"{prompt}\n\n"
                    "CRITICAL: The previous output could not be parsed. "
                    "You must output ONLY raw, valid JSON matching the exact schema."
                )
                try:
                    retry_resp = client.models.generate_content(
                        model=self.model_id,
                        contents=retry_prompt,
                        config=config,
                    )
                    raw_text = retry_resp.text or ""
                    return clean_and_parse_json(raw_text)
                except Exception as retry_err:
                    logger.error(f"Retry generation failed: {retry_err}")
                    raise ModelInferenceError(
                        f"Model inference failed after retry: {retry_err}"
                    ) from retry_err

            raise ModelInferenceError(f"Model generation failed: {err}") from err


# Default module client instance
gemma_client = GemmaStoryClient()
