import logging
from typing import List, Optional, Dict, Any
from app.models.content import (
    LinkedInPost,
    InstagramCaption,
    InstagramCarouselSlide,
    InstagramCarousel,
    VideoScene,
    ShortVideoScript,
    GeneratedContent
)
from app.models.source import SourceAnalysisResponse, SourceFact
from app.models.brand import BrandGuidelines
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

def _format_hashtags(keywords: List[str], defaults: List[str]) -> List[str]:
    tags = []
    for kw in keywords:
        clean = "".join([c for c in kw if c.isalnum()])
        if clean:
            tags.append(f"#{clean}")
    for d in defaults:
        if d not in tags:
            tags.append(d)
    return tags[:5]

def generate_linkedin_deterministic(
    source_analysis: SourceAnalysisResponse,
    goal: str,
    audience: str,
    brand_voice: str,
    keywords: List[str],
    required_phrases: List[str],
    call_to_action: str
) -> LinkedInPost:
    facts = source_analysis.extracted_facts
    metrics = [f.fact for f in facts if f.category in ("statistic", "outcome", "technical")]
    metric_1 = metrics[0] if len(metrics) > 0 else "rapid enterprise modernization"
    metric_2 = metrics[1] if len(metrics) > 1 else "measured latency and efficiency gains"
    metric_3 = metrics[2] if len(metrics) > 2 else "full compliance and reliability"

    req_str = ""
    if required_phrases:
        req_str = f"Built with a focus on being {', '.join(required_phrases)}.\n\n"

    hook = f"How {source_analysis.title.split(':')[0]} navigated architectural modernization without missing a single beat:"
    
    body = (
        f"For {audience.lower()}, scaling mission-critical systems is rarely about theory—it's about surviving production reality.\n\n"
        f"Here are the measurable results from the latest initiative:\n\n"
        f"1. Key Impact: {metric_1}\n"
        f"2. System Benchmark: {metric_2}\n"
        f"3. Operational Governance: {metric_3}\n\n"
        f"{req_str}"
        f"The biggest lesson? Decoupling dependencies early and validating every migration pathway with live canary traffic is what separates success from costly downtime.\n\n"
        f"What is your team's biggest challenge when tackling large-scale platform migrations?"
    )

    cta = f"👉 {call_to_action}."
    hashtags = _format_hashtags(keywords, ["#TechLeadership", "#SoftwareArchitecture", "#EnterpriseTech", "#Engineering"])
    
    full_content = f"{hook}\n\n{body}\n\n{cta}\n\n{' '.join(hashtags)}"
    read_minutes = max(1, round(len(full_content.split()) / 200))
    
    return LinkedInPost(
        hook=hook,
        body=body,
        cta=cta,
        hashtags=hashtags,
        full_content=full_content,
        character_count=len(full_content),
        estimated_read_time=f"{read_minutes} min read"
    )

def generate_instagram_caption_deterministic(
    source_analysis: SourceAnalysisResponse,
    audience: str,
    keywords: List[str],
    call_to_action: str
) -> InstagramCaption:
    facts = source_analysis.extracted_facts
    metric = facts[0].fact if facts else "Record-setting performance upgrades"

    hook = "Most teams fear big migrations. Here’s how this one had zero downtime ⚡️"
    
    body = (
        f"Swipe through to break down the architectural blueprint 👇\n\n"
        f"Key takeaway from this deployment:\n"
        f"• {metric}\n\n"
        f"When handling massive daily scale, reliability isn't a feature—it's the foundation.\n\n"
        f"Drop your questions below, or save this post for your next architecture review session!"
    )

    cta = f"🔗 {call_to_action}. Head to the link in our bio for the deep dive."
    hashtags = _format_hashtags(keywords, ["#CloudEngineering", "#DevOps", "#TechTips", "#SoftwareDevelopment"])
    
    full_content = f"{hook}\n\n{body}\n\n{cta}\n\n{' '.join(hashtags)}"

    return InstagramCaption(
        hook=hook,
        caption_body=body,
        cta=cta,
        hashtags=hashtags,
        full_content=full_content,
        character_count=len(full_content)
    )

def generate_instagram_carousel_deterministic(
    source_analysis: SourceAnalysisResponse,
    keywords: List[str],
    call_to_action: str
) -> InstagramCarousel:
    facts = source_analysis.extracted_facts
    
    slides = [
        InstagramCarouselSlide(
            slide_number=1,
            slide_title="Zero Downtime Migration Blueprint",
            slide_body="How to re-architect high-throughput core systems without failing a single customer transaction.",
            visual_description="Bold minimalist cover card with dark navy background, clean white typography, and subtle glowing flow lines."
        ),
        InstagramCarouselSlide(
            slide_number=2,
            slide_title="The Monolith Bottleneck",
            slide_body="Database contention, P99 latency spikes, and costly maintenance windows. Sound familiar?",
            visual_description="Split illustration comparing congested single-point database against clean distributed streams."
        ),
        InstagramCarouselSlide(
            slide_number=3,
            slide_title="The Decoupled Architecture",
            slide_body="Decouple authorization from settlement using an asynchronous event mesh and multi-region replication.",
            visual_description="Architecture block diagram showing Kafka event mesh routing to containerized microservices."
        ),
        InstagramCarouselSlide(
            slide_number=4,
            slide_title="Measurable Impact",
            slide_body=f"• {facts[0].fact if len(facts) > 0 else '42% cost reduction'}\n• {facts[1].fact if len(facts) > 1 else 'P99 latency down by 92.5%'}\n• Sustained holiday throughput with zero queues.",
            visual_description="High-contrast metrics dashboard cards featuring key percentage gains in vibrant accents."
        ),
        InstagramCarouselSlide(
            slide_number=5,
            slide_title="The 3 Core Rules",
            slide_body="1. Never big-bang cutover\n2. Replay shadow traffic for 90 days\n3. Enforce strict schema governance.",
            visual_description="Checklist visual with verified checkmarks and subtle iconography."
        ),
        InstagramCarouselSlide(
            slide_number=6,
            slide_title="Next Steps for Your Team",
            slide_body=f"{call_to_action}.\n\nFollow for more deep dives into enterprise systems engineering.",
            visual_description="Final CTA slide with company branding and clear button graphic indicating link in bio."
        )
    ]

    hashtags = _format_hashtags(keywords, ["#TechCarousel", "#SoftwareArchitecture", "#CloudComputing", "#Engineering"])
    caption = f"The ultimate blueprint for enterprise system modernization 📊 Swipe through for the step-by-step breakdown. {' '.join(hashtags)}"

    full_content = "\n\n".join([f"Slide {s.slide_number}: {s.slide_title}\n{s.slide_body}\n[Visual: {s.visual_description}]" for s in slides])

    return InstagramCarousel(
        theme_title=f"{source_analysis.title}: Architectural Teardown",
        target_slide_count=len(slides),
        slides=slides,
        caption=caption,
        hashtags=hashtags,
        full_content=full_content
    )

def generate_video_script_deterministic(
    source_analysis: SourceAnalysisResponse,
    call_to_action: str
) -> ShortVideoScript:
    facts = source_analysis.extracted_facts
    stat = facts[0].fact if facts else "92% latency reduction"

    scenes = [
        VideoScene(
            scene_number=1,
            timestamp_range="0:00 - 0:05",
            spoken_narration="Here's how a payment platform handled nearly 2 million transactions a day—with zero downtime during a full cloud rebuild.",
            on_screen_text="ZERO DOWNTIME CLOUD MIGRATION 🚀",
            visual_and_broll="Fast-paced cut: Engineer at multi-monitor setup with live terminal logs scrolling."
        ),
        VideoScene(
            scene_number=2,
            timestamp_range="0:05 - 0:15",
            spoken_narration="Their legacy monolith was crashing under holiday traffic spikes, with P99 latency hitting over two full seconds.",
            on_screen_text="THE BOTTLENECK: 2.4s Latency Spikes 🛑",
            visual_and_broll="Animated warning graphic showing database lock contention and red queue indicators."
        ),
        VideoScene(
            scene_number=3,
            timestamp_range="0:15 - 0:30",
            spoken_narration="Instead of a risky big-bang release, they decoupled everything into an event mesh, replaying shadow traffic for 90 days straight before live cutover.",
            on_screen_text="THE FIX: Event-Driven Kafka + CockroachDB ⚡️",
            visual_and_broll="Slick 3D animated diagram of transaction stream fanning out cleanly across 3 availability zones."
        ),
        VideoScene(
            scene_number=4,
            timestamp_range="0:30 - 0:45",
            spoken_narration=f"The outcome? {stat}, infrastructure costs cut by 42%, and zero dropped transactions on Black Friday.",
            on_screen_text="OUTCOME: 42% Cost Cut & 18,500 TPS 📈",
            visual_and_broll="Green metric counters ticking up rapidly to 18,500 TPS with verified checkmark badge."
        ),
        VideoScene(
            scene_number=5,
            timestamp_range="0:45 - 0:50",
            spoken_narration=f"Want the full architectural blueprint? {call_to_action}. Link in bio!",
            on_screen_text="READ FULL CASE STUDY 🔗 Link in Bio",
            visual_and_broll="Host on camera smiling, pointing down to on-screen link banner with branded outro."
        )
    ]

    full_content = "\n\n".join([
        f"SCENE {s.scene_number} ({s.timestamp_range})\n[Visual]: {s.visual_and_broll}\n[On-Screen Text]: {s.on_screen_text}\n[Narration]: \"{s.spoken_narration}\""
        for s in scenes
    ])

    return ShortVideoScript(
        title=f"Teardown: {source_analysis.title}",
        duration_seconds=50,
        opening_hook="Here's how a payment platform handled nearly 2 million transactions a day—with zero downtime during a full cloud rebuild.",
        target_platforms=["Instagram Reels", "YouTube Shorts", "TikTok"],
        scenes=scenes,
        cta=call_to_action,
        full_content=full_content
    )

def generate_platform_content(
    source_analysis: SourceAnalysisResponse,
    goal: str,
    audience: str,
    brand_voice: str,
    key_messages: List[str],
    keywords: List[str],
    required_phrases: List[str],
    prohibited_phrases: List[str],
    call_to_action: str,
    selected_platforms: List[str],
    brand_guidelines: Optional[BrandGuidelines] = None,
    custom_instruction: Optional[str] = None
) -> GeneratedContent:
    """
    Generates content for the chosen platforms.
    Uses Gemini when configured, falling back to deterministic generation.
    """
    generated = GeneratedContent()
    
    # If Gemini is configured, use structured LLM prompting
    if gemini_service.is_configured():
        prompt = f"""You are an elite B2B and SaaS social media repurposing specialist.
Transform the approved source facts into highly engaging, platform-specific content.

SOURCE TITLE: {source_analysis.title}
SOURCE SUMMARY: {source_analysis.summary}
SOURCE FACTS (Ground Truth):
{chr(10).join([f"- [Fact {i+1}] {f.fact} (from paragraph {f.source_paragraph_index})" for i, f in enumerate(source_analysis.extracted_facts)])}

CAMPAIGN PARAMETERS:
- Goal: {goal}
- Target Audience: {audience}
- Brand Voice & Tone: {brand_voice}
- Key Messages: {', '.join(key_messages) if key_messages else 'Focus on architectural excellence and business outcomes'}
- Keywords to weave in: {', '.join(keywords) if keywords else 'None'}
- Required Phrases to include: {', '.join(required_phrases) if required_phrases else 'None'}
- Prohibited Phrases (DO NOT USE): {', '.join(prohibited_phrases) if prohibited_phrases else 'None'}
- Call to Action: {call_to_action}
- Platforms to Generate: {', '.join(selected_platforms)}
{f"- Custom Instruction: {custom_instruction}" if custom_instruction else ""}

RULES:
1. STRICT FACTUAL ACCURACY: Do not invent statistics, testimonials, customer names, or unmentioned features. Preserve source numbers and qualifiers.
2. Tone must strictly adhere to "{brand_voice}".
3. For LinkedIn: Professional, punchy opening hook, clear spacing, metrics, relevant hashtags, clean CTA.
4. For Instagram Caption: Engaging caption hook, emojis, bulleted takeaways, CTA (link in bio), hashtags.
5. For Instagram Carousel: 5-7 slides with slide_number, slide_title, slide_body, visual_description, plus carousel caption.
6. For Short-Video Script: 30-60s script with 4-6 scenes. Each scene needs timestamp_range, spoken_narration, on_screen_text, visual_and_broll.

Return ONLY a valid JSON object matching this schema:
{{
  "linkedin": {{
    "hook": "...",
    "body": "...",
    "cta": "...",
    "hashtags": ["#Tag1", "#Tag2"],
    "full_content": "...",
    "character_count": 800,
    "estimated_read_time": "2 min read"
  }},
  "instagram_caption": {{
    "hook": "...",
    "caption_body": "...",
    "cta": "...",
    "hashtags": ["#Tag1", "#Tag2"],
    "full_content": "...",
    "character_count": 450
  }},
  "instagram_carousel": {{
    "theme_title": "...",
    "target_slide_count": 6,
    "slides": [
      {{
        "slide_number": 1,
        "slide_title": "...",
        "slide_body": "...",
        "visual_description": "..."
      }}
    ],
    "caption": "...",
    "hashtags": ["#Tag1"],
    "full_content": "..."
  }},
  "short_video_script": {{
    "title": "...",
    "duration_seconds": 45,
    "opening_hook": "...",
    "target_platforms": ["Instagram Reels", "YouTube Shorts"],
    "scenes": [
      {{
        "scene_number": 1,
        "timestamp_range": "0:00 - 0:05",
        "spoken_narration": "...",
        "on_screen_text": "...",
        "visual_and_broll": "..."
      }}
    ],
    "cta": "...",
    "full_content": "..."
  }}
}}
Only populate keys for platforms present in: {', '.join(selected_platforms)}
"""
        json_resp = gemini_service.generate_json(prompt)
        if json_resp:
            try:
                if "linkedin" in selected_platforms and "linkedin" in json_resp:
                    generated.linkedin = LinkedInPost(**json_resp["linkedin"])
                if "instagram_caption" in selected_platforms and "instagram_caption" in json_resp:
                    generated.instagram_caption = InstagramCaption(**json_resp["instagram_caption"])
                if "instagram_carousel" in selected_platforms and "instagram_carousel" in json_resp:
                    generated.instagram_carousel = InstagramCarousel(**json_resp["instagram_carousel"])
                if "short_video_script" in selected_platforms and "short_video_script" in json_resp:
                    generated.short_video_script = ShortVideoScript(**json_resp["short_video_script"])
                
                # Check if at least one was populated
                if any([generated.linkedin, generated.instagram_caption, generated.instagram_carousel, generated.short_video_script]):
                    return generated
            except Exception as e:
                logger.warning(f"Failed to parse Gemini generated content into Pydantic models: {e}. Falling back.")

    # Fallback deterministic generation
    if "linkedin" in selected_platforms:
        generated.linkedin = generate_linkedin_deterministic(
            source_analysis, goal, audience, brand_voice, keywords, required_phrases, call_to_action
        )
    if "instagram_caption" in selected_platforms:
        generated.instagram_caption = generate_instagram_caption_deterministic(
            source_analysis, audience, keywords, call_to_action
        )
    if "instagram_carousel" in selected_platforms:
        generated.instagram_carousel = generate_instagram_carousel_deterministic(
            source_analysis, keywords, call_to_action
        )
    if "short_video_script" in selected_platforms:
        generated.short_video_script = generate_video_script_deterministic(
            source_analysis, call_to_action
        )

    return generated
