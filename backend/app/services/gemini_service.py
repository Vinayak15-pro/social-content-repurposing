import os
import json
import logging
import re
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.model_name = settings.GEMINI_MODEL or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self._client = None
        
        if self.api_key and not self.api_key.startswith("your_"):
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"Initialized Google GenAI client with model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI client: {e}")
                self._client = None

    def is_configured(self) -> bool:
        """Returns True if a valid Gemini API key is configured."""
        return self._client is not None and bool(self.api_key) and not self.api_key.startswith("your_")

    def get_status(self) -> Dict[str, Any]:
        return {
            "configured": self.is_configured(),
            "model": self.model_name,
            "provider": "google-genai",
            "has_key": bool(self.api_key and not self.api_key.startswith("your_"))
        }

    def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """Calls Gemini API to generate text, returning None if client not configured or error occurs."""
        if not self.is_configured():
            return None

        try:
            full_prompt = prompt
            if system_instruction:
                full_prompt = f"SYSTEM INSTRUCTION: {system_instruction}\n\nUSER PROMPT: {prompt}"

            response = self._client.models.generate_content(
                model=self.model_name,
                contents=full_prompt
            )
            if response and hasattr(response, "text"):
                return response.text
        except Exception as e:
            logger.error(f"Error during Gemini generate_text: {e}")
            return None

        return None

    def generate_json(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Calls Gemini and safely extracts/parses JSON from the response."""
        if not self.is_configured():
            return None

        json_prompt = (
            f"{prompt}\n\n"
            f"IMPORTANT: You must output ONLY a single valid JSON object. "
            f"Do not include any introductory remarks, markdown commentary, or explanations outside the JSON."
        )

        raw_response = self.generate_text(json_prompt, system_instruction=system_instruction)
        if not raw_response:
            return None

        return self.extract_json_from_text(raw_response)

    @staticmethod
    def extract_json_from_text(text: str) -> Optional[Dict[str, Any]]:
        """Strips markdown code blocks and parses JSON."""
        if not text:
            return None
        cleaned = text.strip()
        # Remove ```json and ```
        if "```json" in cleaned:
            match = re.search(r"```json\s*(.*?)\s*```", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1).strip()
        elif "```" in cleaned:
            match = re.search(r"```\s*(.*?)\s*```", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1).strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse JSON from response: {e}\nRaw: {cleaned[:300]}")
            return None

gemini_service = GeminiService()
