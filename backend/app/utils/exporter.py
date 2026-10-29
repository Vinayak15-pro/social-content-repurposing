import json
import csv
import io
from typing import Dict, Any
from app.models.campaign import Campaign

def export_to_markdown(campaign: Campaign) -> str:
    """Exports campaign and generated assets to well-formatted Markdown."""
    lines = []
    lines.append(f"# Campaign: {campaign.title}")
    lines.append(f"**Created:** {campaign.created_at} | **Goal:** {campaign.campaign_goal}")
    lines.append(f"**Target Audience:** {campaign.target_audience}")
    lines.append(f"**Brand Voice:** {campaign.brand_voice}")
    if campaign.source_url:
        lines.append(f"**Source URL:** {campaign.source_url}")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Source Summary
    lines.append("## Source Content Summary")
    lines.append(f"> {campaign.source_analysis.summary}")
    lines.append(f"*Word Count:* {campaign.source_analysis.word_count} words | *Extracted Facts:* {len(campaign.source_analysis.extracted_facts)}")
    lines.append("")
    
    # LinkedIn
    if campaign.generated_content.linkedin:
        li = campaign.generated_content.linkedin
        lines.append("## 1. LinkedIn Post")
        lines.append(f"*Character Count: {li.character_count} | Read Time: {li.estimated_read_time}*")
        lines.append("")
        lines.append("```text")
        lines.append(li.full_content)
        lines.append("```")
        lines.append("")
    
    # Instagram Caption
    if campaign.generated_content.instagram_caption:
        ig = campaign.generated_content.instagram_caption
        lines.append("## 2. Instagram Caption")
        lines.append(f"*Character Count: {ig.character_count}*")
        lines.append("")
        lines.append("```text")
        lines.append(ig.full_content)
        lines.append("```")
        lines.append("")

    # Instagram Carousel
    if campaign.generated_content.instagram_carousel:
        car = campaign.generated_content.instagram_carousel
        lines.append("## 3. Instagram Carousel Slides")
        lines.append(f"**Theme:** {car.theme_title} ({len(car.slides)} Slides)")
        lines.append("")
        for slide in car.slides:
            lines.append(f"### Slide {slide.slide_number}: {slide.slide_title}")
            lines.append(f"**Copy:** {slide.slide_body}")
            lines.append(f"**Visual Direction:** *{slide.visual_description}*")
            lines.append("")
        lines.append(f"**Post Caption:**\n{car.caption}")
        lines.append("")

    # Short Video Script
    if campaign.generated_content.short_video_script:
        vid = campaign.generated_content.short_video_script
        lines.append("## 4. Short-Video Script (Reels / Shorts / TikTok)")
        lines.append(f"**Title:** {vid.title} | **Target Duration:** {vid.duration_seconds}s")
        lines.append(f"**Opening Hook:** \"{vid.opening_hook}\"")
        lines.append("")
        for scene in vid.scenes:
            lines.append(f"#### Scene {scene.scene_number} ({scene.timestamp_range})")
            lines.append(f"- **Spoken Narration:** \"{scene.spoken_narration}\"")
            lines.append(f"- **On-Screen Text:** {scene.on_screen_text}")
            lines.append(f"- **Visuals / B-Roll:** {scene.visual_and_broll}")
            lines.append("")
        lines.append(f"**CTA:** {vid.cta}")
        lines.append("")

    # Traceability Report
    lines.append("## 5. Source Fact Traceability Audit")
    lines.append("| Platform | Factual Claim | Status | Source Location | Supporting Excerpt |")
    lines.append("| :--- | :--- | :--- | :--- | :--- |")
    for claim in campaign.traceability_report:
        loc = f"Para {claim.source_paragraph_index + 1}" if claim.source_paragraph_index is not None else "N/A"
        excerpt = (claim.matching_excerpt or "-").replace("\n", " ")
        if len(excerpt) > 90:
            excerpt = excerpt[:87] + "..."
        clean_claim = claim.claim_text.replace("\n", " ")
        lines.append(f"| {claim.platform} | {clean_claim} | **{claim.status.value}** | {loc} | {excerpt} |")
    lines.append("")

    # Brand Compliance
    if campaign.brand_violations:
        lines.append("## 6. Brand Voice Compliance Findings")
        for v in campaign.brand_violations:
            lines.append(f"- **[{v.severity.upper()}] {v.rule_name}** ({v.platform}): {v.explanation}")
            lines.append(f"  *Recommendation:* {v.recommendation}")
        lines.append("")

    return "\n".join(lines)

def export_to_json(campaign: Campaign) -> str:
    """Exports entire campaign data to JSON string."""
    return json.dumps(campaign.model_dump(), indent=2, ensure_ascii=False)

def export_to_csv(campaign: Campaign) -> str:
    """Exports factual claims and traceability matrix to CSV."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Claim ID",
        "Platform",
        "Location",
        "Claim Text",
        "Verification Status",
        "Confidence Score",
        "Source Paragraph Index",
        "Matching Source Excerpt",
        "Explanation",
        "Is Creative Suggestion",
        "Suggested Fix"
    ])
    for c in campaign.traceability_report:
        writer.writerow([
            c.claim_id,
            c.platform,
            c.claim_location,
            c.claim_text,
            c.status.value,
            f"{c.confidence_score:.2f}",
            c.source_paragraph_index if c.source_paragraph_index is not None else "",
            c.matching_excerpt or "",
            c.verification_explanation,
            "Yes" if c.is_creative_suggestion else "No",
            c.suggested_fix or ""
        ])
    return output.getvalue()
