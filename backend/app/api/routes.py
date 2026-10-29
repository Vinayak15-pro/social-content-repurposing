import uuid
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse

from app.models.campaign import (
    Campaign,
    CampaignCreateRequest,
    RegeneratePlatformRequest,
    VerifyContentRequest,
    SafeUrlFetchRequest,
    SafeUrlFetchResponse
)
from app.models.source import SourceAnalysisRequest, SourceAnalysisResponse
from app.models.brand import BrandGuidelines
from app.services.source_analyzer import analyze_source_content
from app.services.content_generator import generate_platform_content
from app.services.traceability_checker import analyze_traceability, verify_single_claim
from app.services.brand_validator import validate_brand_compliance
from app.services.url_fetcher import fetch_url_content
from app.services.gemini_service import gemini_service
from app.utils.sample_data import SAMPLE_SOURCES, get_sample_by_id
from app.utils.exporter import export_to_markdown, export_to_json, export_to_csv

router = APIRouter()

# In-memory store for campaigns and brand guidelines (allows seamless persistence during server run)
CAMPAIGNS_STORE: Dict[str, Campaign] = {}
CURRENT_BRAND_GUIDELINES = BrandGuidelines()

@router.get("/health")
async def health_check():
    """System health check and Gemini service status."""
    return {
        "status": "healthy",
        "service": "Social Content Repurposing Pipeline",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "gemini": gemini_service.get_status()
    }

@router.get("/api/samples")
async def get_samples():
    """Returns available sample articles, case studies, and product pages."""
    return SAMPLE_SOURCES

@router.get("/api/samples/{sample_id}")
async def get_single_sample(sample_id: str):
    return get_sample_by_id(sample_id)

@router.post("/api/source/fetch-url", response_model=SafeUrlFetchResponse)
async def fetch_url(request: SafeUrlFetchRequest):
    """Safely retrieves public web content with SSRF protection."""
    return await fetch_url_content(request.url)

@router.post("/api/source/analyze", response_model=SourceAnalysisResponse)
async def analyze_source(request: SourceAnalysisRequest):
    """Analyzes source text, extracting paragraphs, key facts, and entities."""
    if len(request.source_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Source text must contain at least 20 characters.")
    return analyze_source_content(request)

@router.post("/api/content/generate", response_model=Campaign)
async def generate_campaign(request: CampaignCreateRequest):
    """
    Complete pipeline execution:
    1. Validates inputs
    2. Analyzes source content & extracts ground-truth facts
    3. Generates platform drafts
    4. Performs source-to-post traceability audit
    5. Validates brand voice and compliance rules
    6. Stores and returns full campaign
    """
    if len(request.source_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Source content is too short for repurposing.")
    
    if not request.selected_platforms:
        raise HTTPException(status_code=400, detail="At least one platform must be selected.")

    # 1. Source analysis
    analysis_req = SourceAnalysisRequest(
        source_text=request.source_text,
        source_title=request.source_title,
        source_url=request.source_url
    )
    source_analysis = analyze_source_content(analysis_req)

    # 2. Brand guidelines to apply
    brand_gl = request.brand_guidelines or CURRENT_BRAND_GUIDELINES

    # 3. Content generation
    generated_content = generate_platform_content(
        source_analysis=source_analysis,
        goal=request.campaign_goal,
        audience=request.target_audience,
        brand_voice=request.brand_voice,
        key_messages=request.key_messages,
        keywords=request.keywords,
        required_phrases=request.required_phrases,
        prohibited_phrases=request.prohibited_phrases,
        call_to_action=request.call_to_action,
        selected_platforms=request.selected_platforms,
        brand_guidelines=brand_gl
    )

    # 4. Traceability checking
    traceability_report = analyze_traceability(
        generated_content=generated_content,
        source_analysis=source_analysis
    )

    # 5. Brand voice validation
    brand_violations = validate_brand_compliance(
        generated_content=generated_content,
        brand_guidelines=brand_gl,
        required_phrases=request.required_phrases,
        prohibited_phrases=request.prohibited_phrases
    )

    # 6. Save campaign
    campaign_id = f"cmp-{uuid.uuid4().hex[:10]}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    campaign = Campaign(
        id=campaign_id,
        created_at=now_str,
        updated_at=now_str,
        title=request.source_title or source_analysis.title,
        source_text=request.source_text,
        source_title=request.source_title,
        source_url=request.source_url,
        campaign_goal=request.campaign_goal,
        target_audience=request.target_audience,
        brand_voice=request.brand_voice,
        key_messages=request.key_messages,
        keywords=request.keywords,
        required_phrases=request.required_phrases,
        prohibited_phrases=request.prohibited_phrases,
        call_to_action=request.call_to_action,
        selected_platforms=request.selected_platforms,
        brand_guidelines=brand_gl,
        source_analysis=source_analysis,
        generated_content=generated_content,
        traceability_report=traceability_report,
        brand_violations=brand_violations,
        user_edits={}
    )

    CAMPAIGNS_STORE[campaign_id] = campaign
    return campaign

@router.post("/api/content/regenerate-platform", response_model=Campaign)
async def regenerate_single_platform(request: RegeneratePlatformRequest):
    """
    Regenerates a single asset without wiping other platforms,
    preserves user edits, and updates traceability and brand audits.
    """
    if not request.campaign_id or request.campaign_id not in CAMPAIGNS_STORE:
        raise HTTPException(status_code=404, detail="Campaign not found.")

    campaign = CAMPAIGNS_STORE[request.campaign_id]

    # Generate single platform
    new_generated = generate_platform_content(
        source_analysis=campaign.source_analysis,
        goal=request.campaign_goal,
        audience=request.target_audience,
        brand_voice=request.brand_voice,
        key_messages=request.key_messages,
        keywords=request.keywords,
        required_phrases=request.required_phrases,
        prohibited_phrases=request.prohibited_phrases,
        call_to_action=request.call_to_action,
        selected_platforms=[request.platform],
        brand_guidelines=request.brand_guidelines or campaign.brand_guidelines,
        custom_instruction=request.custom_instruction
    )

    # Update only target platform in campaign
    if request.platform == "linkedin" and new_generated.linkedin:
        campaign.generated_content.linkedin = new_generated.linkedin
    elif request.platform == "instagram_caption" and new_generated.instagram_caption:
        campaign.generated_content.instagram_caption = new_generated.instagram_caption
    elif request.platform == "instagram_carousel" and new_generated.instagram_carousel:
        campaign.generated_content.instagram_carousel = new_generated.instagram_carousel
    elif request.platform == "short_video_script" and new_generated.short_video_script:
        campaign.generated_content.short_video_script = new_generated.short_video_script

    # Refresh traceability & brand validation
    campaign.traceability_report = analyze_traceability(
        generated_content=campaign.generated_content,
        source_analysis=campaign.source_analysis
    )
    campaign.brand_violations = validate_brand_compliance(
        generated_content=campaign.generated_content,
        brand_guidelines=request.brand_guidelines or campaign.brand_guidelines,
        required_phrases=request.required_phrases,
        prohibited_phrases=request.prohibited_phrases
    )
    campaign.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

    CAMPAIGNS_STORE[campaign.id] = campaign
    return campaign

@router.post("/api/content/verify")
async def verify_custom_content(request: VerifyContentRequest):
    """
    On-demand verification of custom or user-edited content for claims and brand rules.
    """
    # Analyze source
    analysis = analyze_source_content(SourceAnalysisRequest(source_text=request.source_text))
    
    # Check claim
    claim_audit = verify_single_claim(
        claim_text=request.content_text,
        platform=request.platform,
        location="User Edited Content",
        paragraphs=analysis.paragraphs,
        extracted_facts=analysis.extracted_facts
    )

    return {
        "claim_verification": claim_audit,
        "source_paragraphs_count": len(analysis.paragraphs)
    }

@router.get("/api/campaigns", response_model=List[Campaign])
async def list_campaigns():
    """Lists all created campaigns sorted newest first."""
    return sorted(list(CAMPAIGNS_STORE.values()), key=lambda c: c.created_at, reverse=True)

@router.get("/api/campaigns/{campaign_id}", response_model=Campaign)
async def get_campaign(campaign_id: str):
    if campaign_id not in CAMPAIGNS_STORE:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    return CAMPAIGNS_STORE[campaign_id]

@router.put("/api/campaigns/{campaign_id}", response_model=Campaign)
async def update_campaign(campaign_id: str, payload: Dict[str, Any]):
    """Update user edits or fields on a campaign."""
    if campaign_id not in CAMPAIGNS_STORE:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    
    campaign = CAMPAIGNS_STORE[campaign_id]
    if "user_edits" in payload:
        campaign.user_edits.update(payload["user_edits"])
    if "title" in payload:
        campaign.title = payload["title"]
    
    campaign.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    CAMPAIGNS_STORE[campaign_id] = campaign
    return campaign

@router.delete("/api/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str):
    if campaign_id not in CAMPAIGNS_STORE:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    del CAMPAIGNS_STORE[campaign_id]
    return {"message": "Campaign deleted successfully", "id": campaign_id}

@router.get("/api/campaigns/{campaign_id}/export")
async def export_campaign(
    campaign_id: str,
    format: str = Query("markdown", pattern="^(markdown|json|csv)$")
):
    """Exports campaign in Markdown, JSON, or CSV format."""
    if campaign_id not in CAMPAIGNS_STORE:
        raise HTTPException(status_code=404, detail="Campaign not found.")
    
    campaign = CAMPAIGNS_STORE[campaign_id]
    
    if format == "json":
        json_data = export_to_json(campaign)
        return Response(
            content=json_data,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={campaign.id}.json"}
        )
    elif format == "csv":
        csv_data = export_to_csv(campaign)
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={campaign.id}_claims.csv"}
        )
    else:  # markdown
        md_data = export_to_markdown(campaign)
        return PlainTextResponse(
            content=md_data,
            headers={"Content-Disposition": f"attachment; filename={campaign.id}.md"}
        )

@router.get("/api/brand-guidelines", response_model=BrandGuidelines)
async def get_brand_guidelines():
    global CURRENT_BRAND_GUIDELINES
    return CURRENT_BRAND_GUIDELINES

@router.put("/api/brand-guidelines", response_model=BrandGuidelines)
async def update_brand_guidelines(guidelines: BrandGuidelines):
    global CURRENT_BRAND_GUIDELINES
    CURRENT_BRAND_GUIDELINES = guidelines
    return CURRENT_BRAND_GUIDELINES
