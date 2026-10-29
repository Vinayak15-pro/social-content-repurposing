from pydantic import BaseModel, Field
from typing import List, Optional

class LinkedInPost(BaseModel):
    hook: str
    body: str
    cta: str
    hashtags: List[str] = Field(default_factory=list)
    full_content: str
    character_count: int
    estimated_read_time: str

class InstagramCaption(BaseModel):
    hook: str
    caption_body: str
    cta: str
    hashtags: List[str] = Field(default_factory=list)
    full_content: str
    character_count: int

class InstagramCarouselSlide(BaseModel):
    slide_number: int
    slide_title: str
    slide_body: str
    visual_description: str

class InstagramCarousel(BaseModel):
    theme_title: str
    target_slide_count: int
    slides: List[InstagramCarouselSlide]
    caption: str
    hashtags: List[str] = Field(default_factory=list)
    full_content: str

class VideoScene(BaseModel):
    scene_number: int
    timestamp_range: str
    spoken_narration: str
    on_screen_text: str
    visual_and_broll: str

class ShortVideoScript(BaseModel):
    title: str
    duration_seconds: int = 45
    opening_hook: str
    target_platforms: List[str] = Field(default_factory=lambda: ["Instagram Reels", "YouTube Shorts", "TikTok"])
    scenes: List[VideoScene]
    cta: str
    full_content: str

class GeneratedContent(BaseModel):
    linkedin: Optional[LinkedInPost] = None
    instagram_caption: Optional[InstagramCaption] = None
    instagram_carousel: Optional[InstagramCarousel] = None
    short_video_script: Optional[ShortVideoScript] = None
