from app.models.source import SourceAnalysisRequest
from app.services.source_analyzer import analyze_source_content
from app.services.content_generator import generate_platform_content

def test_platform_content_generation():
    source_text = """AuraPay migrated its monolithic payment core to event-driven microservices.
    P99 latency decreased by 92.5%, moving from 2,400ms to 180ms.
    Infrastructure operational cost decreased by 42%, saving $1.4 million annually.
    Black Friday throughput reached 18,500 TPS with zero downtime."""

    analysis = analyze_source_content(SourceAnalysisRequest(source_text=source_text, source_title="AuraPay Migration"))

    platforms = ["linkedin", "instagram_caption", "instagram_carousel", "short_video_script"]
    content = generate_platform_content(
        source_analysis=analysis,
        goal="Lead generation",
        audience="Fintech Engineering Leaders",
        brand_voice="Authoritative, metrics-driven",
        key_messages=["Decouple early", "Canary routing"],
        keywords=["Fintech", "Cloud Migration", "Kafka"],
        required_phrases=["enterprise-ready"],
        prohibited_phrases=["cheap"],
        call_to_action="Read our full engineering whitepaper",
        selected_platforms=platforms
    )

    # Verify LinkedIn
    assert content.linkedin is not None
    assert len(content.linkedin.hook) > 10
    assert len(content.linkedin.body) > 30
    assert content.linkedin.character_count > 50
    assert len(content.linkedin.hashtags) > 0

    # Verify Instagram Caption
    assert content.instagram_caption is not None
    assert len(content.instagram_caption.hook) > 5
    assert len(content.instagram_caption.caption_body) > 20

    # Verify Carousel
    assert content.instagram_carousel is not None
    assert len(content.instagram_carousel.slides) >= 4
    for slide in content.instagram_carousel.slides:
        assert slide.slide_number > 0
        assert len(slide.slide_title) > 0
        assert len(slide.visual_description) > 0

    # Verify Video Script
    assert content.short_video_script is not None
    assert content.short_video_script.duration_seconds > 0
    assert len(content.short_video_script.scenes) >= 3
    for scene in content.short_video_script.scenes:
        assert len(scene.spoken_narration) > 0
        assert len(scene.on_screen_text) > 0

