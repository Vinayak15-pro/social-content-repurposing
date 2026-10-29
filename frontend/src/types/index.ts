export type ViewMode = 
  | "dashboard" 
  | "create" 
  | "content" 
  | "traceability" 
  | "brand" 
  | "library" 
  | "settings";

export type TraceabilityStatus = 
  | "Supported by Source"
  | "Partially Supported"
  | "Not Found in Source"
  | "Creative Suggestion — Not a Factual Claim";

export interface ClaimVerification {
  claim_id: string;
  claim_text: string;
  platform: string;
  claim_location: string;
  status: TraceabilityStatus;
  confidence_score: number;
  matching_excerpt?: string | null;
  source_paragraph_index?: number | null;
  verification_explanation: string;
  is_creative_suggestion: boolean;
  suggested_fix?: string | null;
}

export interface BrandViolation {
  rule_name: string;
  violation_type: string;
  platform: string;
  passage: string;
  explanation: string;
  recommendation: string;
  severity: "error" | "warning" | "info";
}

export interface BrandGuidelines {
  brand_name: string;
  tone_and_personality: string[];
  target_audience: string;
  preferred_terminology: Record<string, string>;
  required_phrases: string[];
  prohibited_words: string[];
  unsupported_claims: string[];
  cta_preferences: string[];
  writing_style: string;
  campaign_instructions?: string | null;
}

export interface SourceParagraph {
  index: number;
  text: string;
  char_start: number;
  char_end: number;
  section_title?: string | null;
}

export interface SourceFact {
  id: string;
  fact: string;
  category: string;
  source_paragraph_index: number;
  source_excerpt: string;
}

export interface SourceAnalysisResponse {
  title: string;
  word_count: number;
  character_count: number;
  summary: string;
  paragraphs: SourceParagraph[];
  extracted_facts: SourceFact[];
  key_entities: string[];
}

export interface LinkedInPost {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  full_content: string;
  character_count: number;
  estimated_read_time: string;
}

export interface InstagramCaption {
  hook: string;
  caption_body: string;
  cta: string;
  hashtags: string[];
  full_content: string;
  character_count: number;
}

export interface InstagramCarouselSlide {
  slide_number: number;
  slide_title: string;
  slide_body: string;
  visual_description: string;
}

export interface InstagramCarousel {
  theme_title: string;
  target_slide_count: number;
  slides: InstagramCarouselSlide[];
  caption: string;
  hashtags: string[];
  full_content: string;
}

export interface VideoScene {
  scene_number: number;
  timestamp_range: string;
  spoken_narration: string;
  on_screen_text: string;
  visual_and_broll: string;
}

export interface ShortVideoScript {
  title: string;
  duration_seconds: number;
  opening_hook: string;
  target_platforms: string[];
  scenes: VideoScene[];
  cta: string;
  full_content: string;
}

export interface GeneratedContent {
  linkedin?: LinkedInPost | null;
  instagram_caption?: InstagramCaption | null;
  instagram_carousel?: InstagramCarousel | null;
  short_video_script?: ShortVideoScript | null;
}

export interface Campaign {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  source_text: string;
  source_title?: string | null;
  source_url?: string | null;
  campaign_goal: string;
  target_audience: string;
  brand_voice: string;
  key_messages: string[];
  keywords: string[];
  required_phrases: string[];
  prohibited_phrases: string[];
  call_to_action: string;
  selected_platforms: string[];
  brand_guidelines: BrandGuidelines;
  source_analysis: SourceAnalysisResponse;
  generated_content: GeneratedContent;
  traceability_report: ClaimVerification[];
  brand_violations: BrandViolation[];
  user_edits?: Record<string, any>;
}

export interface SampleSource {
  id: string;
  title: string;
  content_type: string;
  campaign_goal: string;
  target_audience: string;
  brand_voice: string;
  keywords: string[];
  required_phrases: string[];
  prohibited_phrases: string[];
  call_to_action: string;
  text: string;
}

export interface SafeUrlFetchResponse {
  title: string;
  text_content: string;
  url: string;
  word_count: number;
}
