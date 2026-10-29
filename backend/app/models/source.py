from pydantic import BaseModel, Field
from typing import List, Optional

class SourceParagraph(BaseModel):
    index: int
    text: str
    char_start: int
    char_end: int
    section_title: Optional[str] = None

class SourceFact(BaseModel):
    id: str
    fact: str
    category: str = Field(
        default="statistic",
        description="Category: statistic, date, quote, outcome, feature, pricing, technical, company"
    )
    source_paragraph_index: int
    source_excerpt: str

class SourceAnalysisRequest(BaseModel):
    source_text: str = Field(..., min_length=20, max_length=50000)
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    content_type: Optional[str] = "article"  # 'article', 'case_study', 'product_page'

class SourceAnalysisResponse(BaseModel):
    title: str
    word_count: int
    character_count: int
    summary: str
    paragraphs: List[SourceParagraph]
    extracted_facts: List[SourceFact]
    key_entities: List[str]
