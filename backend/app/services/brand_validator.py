import re
from typing import List, Optional, Dict
from app.models.brand import BrandGuidelines, BrandViolation
from app.models.content import GeneratedContent

def validate_brand_compliance(
    generated_content: GeneratedContent,
    brand_guidelines: Optional[BrandGuidelines] = None,
    required_phrases: Optional[List[str]] = None,
    prohibited_phrases: Optional[List[str]] = None
) -> List[BrandViolation]:
    """
    Validates all generated content against brand guidelines, required phrases,
    prohibited words, preferred terminology, and compliance constraints.
    """
    violations: List[BrandViolation] = []
    guidelines = brand_guidelines or BrandGuidelines()

    # Combine explicit request parameters with stored brand guidelines
    req_phrases = list(set((required_phrases or []) + guidelines.required_phrases))
    proh_phrases = list(set((prohibited_phrases or []) + guidelines.prohibited_words))
    unsupported = guidelines.unsupported_claims
    terminology = guidelines.preferred_terminology

    # Platform content map
    platforms: Dict[str, str] = {}
    if generated_content.linkedin:
        platforms["LinkedIn"] = generated_content.linkedin.full_content
    if generated_content.instagram_caption:
        platforms["Instagram Caption"] = generated_content.instagram_caption.full_content
    if generated_content.instagram_carousel:
        platforms["Instagram Carousel"] = generated_content.instagram_carousel.full_content
    if generated_content.short_video_script:
        platforms["Short Video Script"] = generated_content.short_video_script.full_content

    for platform_name, text in platforms.items():
        text_lower = text.lower()

        # 1. Check prohibited words/phrases
        for bad_word in proh_phrases:
            if not bad_word.strip():
                continue
            pattern = r"\b" + re.escape(bad_word.strip().lower()) + r"\b"
            match = re.search(pattern, text_lower)
            if match:
                # Extract snippet around match
                start = max(0, match.start() - 30)
                end = min(len(text), match.end() + 30)
                passage = text[start:end].strip()

                violations.append(
                    BrandViolation(
                        rule_name=f"Prohibited Word: '{bad_word}'",
                        violation_type="prohibited_word_used",
                        platform=platform_name,
                        passage=f"...{passage}...",
                        explanation=f"The term '{bad_word}' is flagged as prohibited under brand compliance rules.",
                        recommendation=f"Replace '{bad_word}' with approved brand-compliant terminology.",
                        severity="error"
                    )
                )

        # 2. Check unsupported claims
        for claim in unsupported:
            if not claim.strip():
                continue
            if claim.strip().lower() in text_lower:
                violations.append(
                    BrandViolation(
                        rule_name=f"Unsupported Claim Pattern: '{claim}'",
                        violation_type="unsupported_claim",
                        platform=platform_name,
                        passage=claim,
                        explanation=f"The phrase '{claim}' constitutes an unsubstantiated commercial guarantee or superlative.",
                        recommendation="Remove superlative or replace with measured, auditable metrics.",
                        severity="error"
                    )
                )

        # 3. Check preferred terminology
        for old_term, new_term in terminology.items():
            if not old_term.strip():
                continue
            pattern = r"\b" + re.escape(old_term.strip().lower()) + r"\b"
            match = re.search(pattern, text_lower)
            if match:
                start = max(0, match.start() - 25)
                end = min(len(text), match.end() + 25)
                passage = text[start:end].strip()
                violations.append(
                    BrandViolation(
                        rule_name=f"Terminology Mismatch: '{old_term}'",
                        violation_type="terminology_mismatch",
                        platform=platform_name,
                        passage=f"...{passage}...",
                        explanation=f"Brand guidelines prefer '{new_term}' instead of '{old_term}'.",
                        recommendation=f"Update '{old_term}' to '{new_term}' for brand consistency.",
                        severity="info"
                    )
                )

        # 4. Check CTA consistency (avoid generic 'click here')
        if "click here" in text_lower:
            violations.append(
                BrandViolation(
                    rule_name="Generic Call-To-Action",
                    violation_type="cta_inconsistencies",
                    platform=platform_name,
                    passage="click here",
                    explanation="Generic 'click here' CTAs underperform and dilute brand voice.",
                    recommendation=f"Use action-oriented CTA such as: '{guidelines.cta_preferences[0] if guidelines.cta_preferences else 'Explore the architecture'}'.",
                    severity="warning"
                )
            )

    # 5. Check required phrases across the campaign (at least in LinkedIn or Primary platforms)
    for phrase in req_phrases:
        if not phrase.strip():
            continue
        phrase_found_in_any = any(phrase.strip().lower() in text.lower() for text in platforms.values())
        if not phrase_found_in_any:
            violations.append(
                BrandViolation(
                    rule_name=f"Missing Required Phrase: '{phrase}'",
                    violation_type="required_phrase_missing",
                    platform="Campaign-Wide",
                    passage="N/A",
                    explanation=f"The required campaign phrase '{phrase}' was not detected in any generated platform copy.",
                    recommendation=f"Incorporate '{phrase}' into the post body or carousel slides to satisfy campaign standards.",
                    severity="warning"
                )
            )

    return violations
