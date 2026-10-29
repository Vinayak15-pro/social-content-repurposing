import re
from typing import List, Tuple
from app.models.source import SourceParagraph

def clean_text(text: str) -> str:
    """Normalize whitespace and strip unexpected control characters."""
    if not text:
        return ""
    # Normalize carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Remove null bytes or weird control codes
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    return text.strip()

def split_into_paragraphs(raw_text: str) -> List[SourceParagraph]:
    """
    Splits text into structured paragraphs with precise character offsets
    and identifies candidate section headings (Markdown or short lines).
    """
    cleaned = clean_text(raw_text)
    raw_blocks = re.split(r"\n\s*\n+", cleaned)
    
    paragraphs: List[SourceParagraph] = []
    current_char = 0
    current_section = "Introduction"
    
    for i, block in enumerate(raw_blocks):
        block_text = block.strip()
        if not block_text:
            continue
        
        # Check if block is a heading (Markdown # or short capitalized title without terminal punctuation)
        is_heading = False
        if block_text.startswith(("# ", "## ", "### ", "#### ")):
            is_heading = True
            current_section = block_text.lstrip("#").strip()
        elif len(block_text) < 70 and not block_text.endswith((".", ":", ";", "?", "!")) and "\n" not in block_text:
            # Likely a section heading
            current_section = block_text
            is_heading = True

        char_start = raw_text.find(block_text, current_char)
        if char_start == -1:
            char_start = current_char
        char_end = char_start + len(block_text)
        current_char = char_end

        paragraphs.append(
            SourceParagraph(
                index=len(paragraphs),
                text=block_text,
                char_start=char_start,
                char_end=char_end,
                section_title=current_section if not is_heading else None
            )
        )
        
    return paragraphs

def count_words(text: str) -> int:
    """Return count of whitespace-delimited words."""
    if not text:
        return 0
    return len(re.findall(r"\b\w+\b", text))
