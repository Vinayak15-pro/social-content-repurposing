from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.models.brand import BrandGuidelines, BrandViolation
from app.models.source import SourceAnalysisResponse
from app.models.content import GeneratedContent
from app.models.traceability import ClaimVerification

class CampaignCreateRequest(BaseModel):
    source_text: str = Field(..., min_length=20, max_length=50000)
    source_title: Optional[str] = "Untitled Document"
    source_url: Optional[str] = None
    campaign_goal: str = Field(default="Thought Leadership & Educating Audience")
    target_audience: str = Field(default="Tech decision makers and software practitioners")
    brand_voice: str = Field(default="Authoritative, insightful, data-driven")
    key_messages: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    required_phrases: List[str] = Field(default_factory=list)
    prohibited_phrases: List[str] = Field(default_factory=list)
    call_to_action: str = Field(default="Read the complete article to learn more")
    selected_platforms: List[str] = Field(
        default_factory=lambda: ["linkedin", "instagram_caption", "instagram_carousel", "short_video_script"]
    )
    brand_guidelines: Optional[BrandGuidelines] = None

class RegeneratePlatformRequest(BaseModel):
    campaign_id: Optional[str] = None
    platform: str  # 'linkedin', 'instagram_caption', 'instagram_carousel', 'short_video_script'
    source_text: str
    campaign_goal: str
    target_audience: str
    brand_voice: str
    key_messages: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    required_phrases: List[str] = Field(default_factory=list)
    prohibited_phrases: List[str] = Field(default_factory=list)
    call_to_action: str
    brand_guidelines: Optional[BrandGuidelines] = None
    custom_instruction: Optional[str] = None

class VerifyContentRequest(BaseModel):
    source_text: str
    platform: str
    content_text: str
    brand_guidelines: Optional[BrandGuidelines] = None
    required_phrases: List[str] = Field(default_factory=list)
    prohibited_phrases: List[str] = Field(default_factory=list)

class SafeUrlFetchRequest(BaseModel):
    url: str

class SafeUrlFetchResponse(BaseModel):
    title: str
    text_content: str
    url: str
    word_count: int

class Campaign(BaseModel):
    id: str
    created_at: str
    updated_at: str
    title: str
    source_text: str
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    campaign_goal: str
    target_audience: str
    brand_voice: str
    key_messages: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    required_phrases: List[str] = Field(default_factory=list)
    prohibited_phrases: List[str] = Field(default_factory=list)
    call_to_action: str
    selected_platforms: List[str] = Field(default_factory=list)
    brand_guidelines: BrandGuidelines
    source_analysis: SourceAnalysisResponse
    generated_content: GeneratedContent
    traceability_report: List[ClaimVerification] = Field(default_factory=list)
    brand_violations: List[BrandViolation] = Field(default_factory=list)
    user_edits: Dict[str, Any] = Field(default_factory=dict)

