from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional

class TraceabilityStatus(str, Enum):
    SUPPORTED = "Supported by Source"
    PARTIALLY_SUPPORTED = "Partially Supported"
    NOT_FOUND = "Not Found in Source"
    CREATIVE_SUGGESTION = "Creative Suggestion — Not a Factual Claim"

class ClaimVerification(BaseModel):
    claim_id: str
    claim_text: str
    platform: str
    claim_location: str  # e.g., "Paragraph 2", "Slide 3", "Scene 1"
    status: TraceabilityStatus
    confidence_score: float = Field(ge=0.0, le=1.0)
    matching_excerpt: Optional[str] = None
    source_paragraph_index: Optional[int] = None
    verification_explanation: str
    is_creative_suggestion: bool = False
    suggested_fix: Optional[str] = None

