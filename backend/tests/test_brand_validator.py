from app.models.brand import BrandGuidelines
from app.models.content import GeneratedContent, LinkedInPost
from app.services.brand_validator import validate_brand_compliance

def test_brand_validator_catches_prohibited_words():
    content = GeneratedContent(
        linkedin=LinkedInPost(
            hook="Our product is cheap and miracle-level fast",
            body="AuraPay provides a cheap solution for payments.",
            cta="Explore our architecture",
            hashtags=["#Fintech"],
            full_content="Our product is cheap and miracle-level fast. AuraPay provides a cheap solution for payments. Explore our architecture. #Fintech",
            character_count=130,
            estimated_read_time="1 min read"
        )
    )

    guidelines = BrandGuidelines(
        prohibited_words=["cheap", "miracle"],
        required_phrases=["enterprise-ready"]
    )

    violations = validate_brand_compliance(content, brand_guidelines=guidelines)
    assert len(violations) >= 2
    types = [v.violation_type for v in violations]
    assert "prohibited_word_used" in types
    assert "required_phrase_missing" in types

def test_brand_validator_clean_content():
    content = GeneratedContent(
        linkedin=LinkedInPost(
            hook="AuraPay successfully modernized its distributed transaction engine.",
            body="Operating costs dropped by 42%. Built enterprise-ready and SOC2 Type II certified.",
            cta="Explore our architecture",
            hashtags=["#Fintech"],
            full_content="AuraPay successfully modernized its distributed transaction engine. Operating costs dropped by 42%. Built enterprise-ready and SOC2 Type II certified. Explore our architecture #Fintech",
            character_count=210,
            estimated_read_time="1 min read"
        )
    )

    guidelines = BrandGuidelines(
        prohibited_words=["cheap", "miracle"],
        required_phrases=["enterprise-ready"]
    )

    violations = validate_brand_compliance(content, brand_guidelines=guidelines)
    # Should have no prohibited word or required phrase errors
    serious_errors = [v for v in violations if v.severity == "error"]
    assert len(serious_errors) == 0

