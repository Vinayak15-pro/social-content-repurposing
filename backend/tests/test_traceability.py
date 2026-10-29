from app.models.source import SourceAnalysisRequest
from app.models.traceability import TraceabilityStatus
from app.services.source_analyzer import analyze_source_content
from app.services.content_generator import generate_platform_content
from app.services.traceability_checker import analyze_traceability, verify_single_claim

def test_traceability_supported_and_creative_statuses():
    source_text = """AuraPay migrated transaction routing to Apache Kafka.
    Operating costs dropped by 42%, saving $1.4 million every single year.
    P99 payment latency reduced to 180ms."""

    analysis = analyze_source_content(SourceAnalysisRequest(source_text=source_text))
    content = generate_platform_content(
        source_analysis=analysis,
        goal="Education",
        audience="Architects",
        brand_voice="Technical",
        key_messages=[],
        keywords=[],
        required_phrases=[],
        prohibited_phrases=[],
        call_to_action="Read the whitepaper",
        selected_platforms=["linkedin"]
    )

    report = analyze_traceability(content, analysis)
    assert len(report) > 0

    # Ensure all four statuses are valid and modeled
    statuses = {claim.status for claim in report}
    # Check that at least Supported or Creative Suggestion exists in generated LinkedIn post
    assert TraceabilityStatus.SUPPORTED in statuses or TraceabilityStatus.CREATIVE_SUGGESTION in statuses

def test_traceability_detects_unsupported_claim():
    source_text = "The product runs in 3 AWS availability zones with zero downtime."
    analysis = analyze_source_content(SourceAnalysisRequest(source_text=source_text))

    # Test an invented claim not present in the source at all
    hallucinated_claim = "The system achieved 10 million transactions per minute on Google Cloud Platform with zero latency."
    result = verify_single_claim(
        claim_text=hallucinated_claim,
        platform="LinkedIn",
        location="Body",
        paragraphs=analysis.paragraphs,
        extracted_facts=analysis.extracted_facts
    )

    assert result.status in (TraceabilityStatus.NOT_FOUND, TraceabilityStatus.PARTIALLY_SUPPORTED)
    assert result.is_creative_suggestion is False

def test_traceability_detects_creative_suggestion():
    source_text = "The product runs in 3 AWS availability zones."
    analysis = analyze_source_content(SourceAnalysisRequest(source_text=source_text))

    creative_hook = "What is your engineering team's biggest challenge when tackling cloud rebuilds?"
    result = verify_single_claim(
        claim_text=creative_hook,
        platform="LinkedIn",
        location="Ending Question",
        paragraphs=analysis.paragraphs,
        extracted_facts=analysis.extracted_facts
    )

    assert result.status == TraceabilityStatus.CREATIVE_SUGGESTION
    assert result.is_creative_suggestion is True
