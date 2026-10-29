import re
import uuid
from typing import List, Dict, Any, Optional, Tuple
from app.models.source import SourceAnalysisResponse, SourceParagraph, SourceFact
from app.models.content import GeneratedContent
from app.models.traceability import ClaimVerification, TraceabilityStatus
from app.services.gemini_service import gemini_service

def is_creative_or_structural(sentence: str) -> bool:
    """Detects rhetorical hooks, CTAs, transitions, questions, and formatting markers."""
    s = sentence.strip().lower()
    if s.endswith("?"):
        return True
    if any(s.startswith(prefix) for prefix in [
        "swipe through", "drop your", "save this post", "here is how", "here's how",
        "what is your", "read the full", "click the link", "👉", "🔗", "⚡️", "📊",
        "follow for more", "the biggest lesson?", "the outcome?", "want the full"
    ]):
        return True
    if len(s) < 25 and not any(char.isdigit() for char in s):
        return True
    return False

def find_best_source_match(claim_text: str, paragraphs: List[SourceParagraph]) -> Tuple[Optional[int], Optional[str], float]:
    """
    Finds the source paragraph with highest lexical & token overlap with the claim.
    Returns (paragraph_index, matching_excerpt, overlap_score).
    """
    claim_tokens = set(re.findall(r"\b[a-zA-Z0-9_\-\%]+\b", claim_text.lower()))
    # Remove common stop words
    stop_words = {"the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "is", "was", "were", "this", "that", "from", "by", "as", "of"}
    meaningful_claim_tokens = claim_tokens - stop_words
    
    if not meaningful_claim_tokens:
        return None, None, 0.0

    best_idx = None
    best_excerpt = None
    highest_score = 0.0

    # Also extract numbers or percentages from claim
    claim_numbers = set(re.findall(r"\b\d+(?:\.\d+)?(?:\%|ms|s|k|m|b)?\b", claim_text.lower()))

    for p in paragraphs:
        p_text_lower = p.text.lower()
        p_tokens = set(re.findall(r"\b[a-zA-Z0-9_\-\%]+\b", p_text_lower))
        
        common = meaningful_claim_tokens.intersection(p_tokens)
        score = len(common) / len(meaningful_claim_tokens)

        # Bonus if exact numbers match
        if claim_numbers:
            common_numbers = [num for num in claim_numbers if num in p_text_lower]
            if common_numbers:
                score += 0.3 * (len(common_numbers) / len(claim_numbers))

        if score > highest_score:
            highest_score = score
            best_idx = p.index
            # Find best sentence inside paragraph
            sentences = re.split(r"(?<=[.!?])\s+", p.text)
            best_sent = p.text[:180]
            max_s_score = 0
            for sent in sentences:
                s_tokens = set(re.findall(r"\b[a-zA-Z0-9_\-\%]+\b", sent.lower()))
                s_score = len(meaningful_claim_tokens.intersection(s_tokens))
                if s_score > max_s_score:
                    max_s_score = s_score
                    best_sent = sent.strip()
            best_excerpt = best_sent

    return best_idx, best_excerpt, min(1.0, highest_score)

def verify_single_claim(
    claim_text: str,
    platform: str,
    location: str,
    paragraphs: List[SourceParagraph],
    extracted_facts: List[SourceFact]
) -> ClaimVerification:
    """Verifies a single claim against source paragraphs deterministically with high fidelity."""
    clean_claim = claim_text.strip()
    
    # 1. Creative suggestion check
    if is_creative_or_structural(clean_claim):
        return ClaimVerification(
            claim_id=f"claim-{uuid.uuid4().hex[:8]}",
            claim_text=clean_claim,
            platform=platform,
            claim_location=location,
            status=TraceabilityStatus.CREATIVE_SUGGESTION,
            confidence_score=0.95,
            matching_excerpt=None,
            source_paragraph_index=None,
            verification_explanation="Creative phrasing, hook, or call to action intended to engage reader; no verifiable factual statement made.",
            is_creative_suggestion=True,
            suggested_fix=None
        )

    # 2. Check for exact fact matches from extracted_facts
    for f in extracted_facts:
        if f.fact.lower() in clean_claim.lower() or clean_claim.lower() in f.fact.lower():
            return ClaimVerification(
                claim_id=f"claim-{uuid.uuid4().hex[:8]}",
                claim_text=clean_claim,
                platform=platform,
                claim_location=location,
                status=TraceabilityStatus.SUPPORTED,
                confidence_score=0.98,
                matching_excerpt=f.source_excerpt,
                source_paragraph_index=f.source_paragraph_index,
                verification_explanation=f"Directly verified by source paragraph {f.source_paragraph_index + 1}. Matches ground truth metric.",
                is_creative_suggestion=False,
                suggested_fix=None
            )

    # 3. Check paragraph overlap
    best_idx, best_excerpt, score = find_best_source_match(clean_claim, paragraphs)

    # Extract numbers from claim
    claim_numbers = set(re.findall(r"\b\d+(?:\.\d+)?(?:\%|ms|s|k|m|b)?\b", clean_claim.lower()))

    if best_idx is not None and score >= 0.50:
        # Check if numbers are consistent
        if claim_numbers:
            p_text = paragraphs[best_idx].text.lower()
            unmatched_numbers = [n for n in claim_numbers if n not in p_text]
            if unmatched_numbers and len(unmatched_numbers) == len(claim_numbers):
                return ClaimVerification(
                    claim_id=f"claim-{uuid.uuid4().hex[:8]}",
                    claim_text=clean_claim,
                    platform=platform,
                    claim_location=location,
                    status=TraceabilityStatus.PARTIALLY_SUPPORTED,
                    confidence_score=0.65,
                    matching_excerpt=best_excerpt,
                    source_paragraph_index=best_idx,
                    verification_explanation=f"Concept found in paragraph {best_idx + 1}, but numbers ({', '.join(unmatched_numbers)}) do not appear in the source passage.",
                    is_creative_suggestion=False,
                    suggested_fix=f"Align numbers strictly with source passage: \"{best_excerpt}\""
                )

        return ClaimVerification(
            claim_id=f"claim-{uuid.uuid4().hex[:8]}",
            claim_text=clean_claim,
            platform=platform,
            claim_location=location,
            status=TraceabilityStatus.SUPPORTED,
            confidence_score=round(max(0.85, score), 2),
            matching_excerpt=best_excerpt,
            source_paragraph_index=best_idx,
            verification_explanation=f"Verified against source paragraph {best_idx + 1} with high textual and semantic alignment.",
            is_creative_suggestion=False,
            suggested_fix=None
        )

    elif best_idx is not None and score >= 0.25:
        return ClaimVerification(
            claim_id=f"claim-{uuid.uuid4().hex[:8]}",
            claim_text=clean_claim,
            platform=platform,
            claim_location=location,
            status=TraceabilityStatus.PARTIALLY_SUPPORTED,
            confidence_score=round(score, 2),
            matching_excerpt=best_excerpt,
            source_paragraph_index=best_idx,
            verification_explanation=f"Contextually related to paragraph {best_idx + 1}, but some assertions or qualifiers are altered.",
            is_creative_suggestion=False,
            suggested_fix="Review and qualify claim against source paragraph."
        )
    else:
        return ClaimVerification(
            claim_id=f"claim-{uuid.uuid4().hex[:8]}",
            claim_text=clean_claim,
            platform=platform,
            claim_location=location,
            status=TraceabilityStatus.NOT_FOUND,
            confidence_score=0.15,
            matching_excerpt=None,
            source_paragraph_index=None,
            verification_explanation="No supporting evidence found in the approved source document. Possible hallucination or unverified extrapolation.",
            is_creative_suggestion=False,
            suggested_fix="Remove claim or replace with verified metric from source."
        )

def analyze_traceability(
    generated_content: GeneratedContent,
    source_analysis: SourceAnalysisResponse
) -> List[ClaimVerification]:
    """
    Extracts claims from all generated platform drafts and performs
    comprehensive source-to-post traceability audit.
    """
    reports: List[ClaimVerification] = []
    paras = source_analysis.paragraphs
    facts = source_analysis.extracted_facts

    # 1. LinkedIn
    if generated_content.linkedin:
        li = generated_content.linkedin
        reports.append(
            verify_single_claim(li.hook, "LinkedIn", "Opening Hook", paras, facts)
        )
        body_lines = [line.strip() for line in li.body.split("\n\n") if line.strip()]
        for i, line in enumerate(body_lines):
            # Split sentences if line contains multiple
            sentences = re.split(r"(?<=[.!?])\s+", line)
            for s in sentences:
                if len(s.strip()) > 15:
                    reports.append(
                        verify_single_claim(s.strip(), "LinkedIn", f"Body Paragraph {i+1}", paras, facts)
                    )
        reports.append(
            verify_single_claim(li.cta, "LinkedIn", "Call To Action", paras, facts)
        )

    # 2. Instagram Caption
    if generated_content.instagram_caption:
        ig = generated_content.instagram_caption
        reports.append(
            verify_single_claim(ig.hook, "Instagram Caption", "Hook", paras, facts)
        )
        ig_sentences = re.split(r"(?<=[.!?\n])\s+", ig.caption_body)
        for s in ig_sentences:
            if len(s.strip()) > 20 and not s.strip().startswith("#"):
                reports.append(
                    verify_single_claim(s.strip(), "Instagram Caption", "Caption Body", paras, facts)
                )

    # 3. Instagram Carousel
    if generated_content.instagram_carousel:
        car = generated_content.instagram_carousel
        for slide in car.slides:
            reports.append(
                verify_single_claim(slide.slide_title, "Instagram Carousel", f"Slide {slide.slide_number} Title", paras, facts)
            )
            # Break down slide body items
            slide_items = [b.strip() for b in slide.slide_body.split("\n") if b.strip()]
            for item in slide_items:
                reports.append(
                    verify_single_claim(item, "Instagram Carousel", f"Slide {slide.slide_number} Body", paras, facts)
                )

    # 4. Short Video Script
    if generated_content.short_video_script:
        vid = generated_content.short_video_script
        reports.append(
            verify_single_claim(vid.opening_hook, "Short Video Script", "Opening Hook", paras, facts)
        )
        for scene in vid.scenes:
            reports.append(
                verify_single_claim(scene.spoken_narration, "Short Video Script", f"Scene {scene.scene_number} Narration", paras, facts)
            )
            if scene.on_screen_text and len(scene.on_screen_text) > 10:
                reports.append(
                    verify_single_claim(scene.on_screen_text, "Short Video Script", f"Scene {scene.scene_number} On-Screen Text", paras, facts)
                )

    # Deduplicate very similar consecutive claims to keep UI clean and informative
    deduped: List[ClaimVerification] = []
    seen_texts = set()
    for rep in reports:
        norm = re.sub(r"[^\w\s]", "", rep.claim_text.lower()).strip()
        if norm and norm not in seen_texts:
            seen_texts.add(norm)
            deduped.append(rep)

    return deduped
