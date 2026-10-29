from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class BrandGuidelines(BaseModel):
    brand_name: str = Field(default="Acme Corp", description="Brand or organization name")
    tone_and_personality: List[str] = Field(
        default_factory=lambda: ["Authoritative", "Approachable", "Insightful", "Data-driven"],
        description="Key personality attributes"
    )
    target_audience: str = Field(
        default="B2B Technology Leaders, Engineering Directors, and VP Product",
        description="Core target persona"
    )
    preferred_terminology: Dict[str, str] = Field(
        default_factory=lambda: {
            "customer": "client partner",
            "bot": "AI automation agent",
            "cheap": "cost-efficient",
            "features": "capabilities"
        },
        description="Preferred substitutes for standard words"
    )
    required_phrases: List[str] = Field(
        default_factory=lambda: ["enterprise-ready", "SOC2 Type II certified"],
        description="Phrases that must appear in marketing copy"
    )
    prohibited_words: List[str] = Field(
        default_factory=lambda: ["cheap", "guaranteed 100%", "miracle", "foolproof", "unmatched", "silver bullet"],
        description="Disallowed marketing hype or compliance hazards"
    )
    unsupported_claims: List[str] = Field(
        default_factory=lambda: ["#1 in the universe", "zero bugs", "instant 10x ROI"],
        description="Statements not permitted without legal approval"
    )
    cta_preferences: List[str] = Field(
        default_factory=lambda: [
            "Explore the technical architecture",
            "Request a bespoke demonstration",
            "Read the complete engineering benchmark"
        ],
        description="Recommended calls to action"
    )
    writing_style: str = Field(
        default="Concise, active voice, concrete metrics before qualitative claims.",
        description="Overall editorial style guideline"
    )
    campaign_instructions: Optional[str] = Field(
        default=None,
        description="Optional campaign-specific constraints"
    )

class BrandViolation(BaseModel):
    rule_name: str
    violation_type: str  # 'required_phrase_missing', 'prohibited_word_used', 'terminology_mismatch', 'tone_mismatch', 'unsupported_claim'
    platform: str
    passage: str
    explanation: str
    recommendation: str
    severity: str = "warning"  # 'error', 'warning', 'info'
