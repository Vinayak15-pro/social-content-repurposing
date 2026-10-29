import re
import uuid
from typing import List, Dict, Any, Optional
from app.models.source import SourceAnalysisRequest, SourceAnalysisResponse, SourceParagraph, SourceFact
from app.utils.text_cleaner import split_into_paragraphs, count_words
from app.services.gemini_service import gemini_service

def extract_facts_deterministically(paragraphs: List[SourceParagraph]) -> List[SourceFact]:
    """
    Deterministic rule-based fact extractor for offline / fallback mode.
    Extracts metrics, percentages, dollar amounts, throughput rates, durations,
    and technical claims directly from the exact source text with accurate paragraph references.
    """
    facts: List[SourceFact] = []
    
    # Patterns for statistics, metrics, dates, and quantitative claims
    metric_pattern = re.compile(
        r"(\b\d+(?:\.\d+)?(?:\%|ms|s| TPS|M|B|k|x)?\b|\$\d+(?:\.\d+)?(?:\s*(?:million|billion|M|B))?|\b\d+ (?:days|weeks|months|deployments|customers|merchants|inquiries|transactions)\b)",
        re.IGNORECASE
    )

    for p in paragraphs:
        # Split paragraph into sentences
        sentences = re.split(r"(?<=[.!?])\s+", p.text)
        for s in sentences:
            s_clean = s.strip()
            if not s_clean or len(s_clean) < 15:
                continue
            
            # Check for numbers, statistics, or metrics
            if metric_pattern.search(s_clean):
                category = "statistic"
                if "$" in s_clean or "cost" in s_clean.lower() or "saving" in s_clean.lower():
                    category = "outcome"
                elif "latency" in s_clean.lower() or "tps" in s_clean.lower() or "ms" in s_clean.lower() or "throughput" in s_clean.lower():
                    category = "technical"
                elif "compliant" in s_clean.lower() or "soc2" in s_clean.lower() or "pci" in s_clean.lower():
                    category = "feature"
                elif "week" in s_clean.lower() or "month" in s_clean.lower() or "q3" in s_clean.lower() or "202" in s_clean:
                    category = "date"

                facts.append(
                    SourceFact(
                        id=f"fact-{uuid.uuid4().hex[:8]}",
                        fact=s_clean,
                        category=category,
                        source_paragraph_index=p.index,
                        source_excerpt=s_clean
                    )
                )
            elif any(w in s_clean.lower() for w in ["certified", "soc2", "kafka", "cockroachdb", "kubernetes", "salesforce", "zendesk", "multi-raft"]):
                facts.append(
                    SourceFact(
                        id=f"fact-{uuid.uuid4().hex[:8]}",
                        fact=s_clean,
                        category="feature",
                        source_paragraph_index=p.index,
                        source_excerpt=s_clean
                    )
                )

    # If too few facts extracted, add significant key sentences
    if len(facts) < 3:
        for p in paragraphs[:4]:
            if len(p.text) > 40:
                facts.append(
                    SourceFact(
                        id=f"fact-{uuid.uuid4().hex[:8]}",
                        fact=p.text[:140],
                        category="outcome",
                        source_paragraph_index=p.index,
                        source_excerpt=p.text[:140]
                    )
                )

    return facts[:15]  # Keep top 15 most salient facts

def generate_summary_deterministically(paragraphs: List[SourceParagraph], title: str) -> str:
    """Generates an executive summary deterministically from the opening paragraphs."""
    content_paras = [p.text for p in paragraphs if len(p.text) > 60]
    if not content_paras:
        return f"Summary of {title}."
    
    first_p = content_paras[0]
    # If first p is long, grab first 2 sentences
    sentences = re.split(r"(?<=[.!?])\s+", first_p)
    return " ".join(sentences[:2]) if len(sentences) >= 2 else first_p

def extract_entities_deterministically(text: str) -> List[str]:
    """Extracts prominent capitalized phrases and technology keywords."""
    tech_keywords = [
        "Kubernetes", "AWS", "Kafka", "CockroachDB", "Salesforce", "Zendesk", 
        "Jira", "Stripe", "Datadog", "SOC2 Type II", "PCI-DSS", "Protobuf",
        "Multi-Raft", "Microservices", "Canary Routing", "mTLS"
    ]
    found = [k for k in tech_keywords if re.search(r"\b" + re.escape(k) + r"\b", text, re.IGNORECASE)]
    # Also find Proper Nouns / Capitalized pairs
    caps = re.findall(r"\b[A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)\b", text)
    for c in caps[:5]:
        if c not in found and len(c) > 4:
            found.append(c)
    return list(dict.fromkeys(found))[:8]

def analyze_source_content(request: SourceAnalysisRequest) -> SourceAnalysisResponse:
    """
    Analyzes source content:
    - Splits text into paragraphs with exact offsets
    - Extracts ground-truth facts and associations
    - Utilizes Gemini if configured, otherwise deterministic extraction
    """
    paragraphs = split_into_paragraphs(request.source_text)
    word_count = count_words(request.source_text)
    char_count = len(request.source_text)
    
    # Infer title if not given
    title = request.source_title
    if not title or title.strip() == "Untitled Document":
        if paragraphs and paragraphs[0].section_title:
            title = paragraphs[0].section_title
        elif paragraphs and len(paragraphs[0].text) < 100 and "\n" not in paragraphs[0].text:
            title = paragraphs[0].text.lstrip("#").strip()
        else:
            title = "Repurposed Campaign Source"

    # Check if Gemini can perform enhanced semantic extraction
    if gemini_service.is_configured():
        prompt = f"""You are a senior editorial fact extraction engine.
Analyze the following source document. The document has {len(paragraphs)} paragraphs.
Here are the paragraphs with their 0-based indices:
{chr(10).join([f"[{p.index}] {p.text[:300]}..." for p in paragraphs[:15]])}

Extract:
1. "summary": A 2-sentence executive summary.
2. "facts": A list of up to 10 key factual statements (statistics, metrics, outcomes, dates, features).
   For each fact include:
   - "fact": Clear statement of the fact
   - "category": One of "statistic", "outcome", "feature", "date", "technical"
   - "source_paragraph_index": Exact integer index of the paragraph where this appears
   - "source_excerpt": The exact quotation or passage from that paragraph
3. "key_entities": List of key company names, products, or core technologies.

Return JSON in this format:
{{
  "summary": "...",
  "key_entities": ["..."],
  "facts": [
    {{
      "fact": "...",
      "category": "statistic",
      "source_paragraph_index": 0,
      "source_excerpt": "..."
    }}
  ]
}}
"""
        gemini_result = gemini_service.generate_json(prompt)
        if gemini_result and "facts" in gemini_result and isinstance(gemini_result["facts"], list):
            extracted_facts = []
            for item in gemini_result["facts"]:
                idx = item.get("source_paragraph_index", 0)
                if not (0 <= idx < len(paragraphs)):
                    idx = 0
                excerpt = item.get("source_excerpt", "")
                if not excerpt or excerpt not in paragraphs[idx].text:
                    excerpt = paragraphs[idx].text[:120]

                extracted_facts.append(
                    SourceFact(
                        id=f"fact-{uuid.uuid4().hex[:8]}",
                        fact=item.get("fact", ""),
                        category=item.get("category", "statistic"),
                        source_paragraph_index=idx,
                        source_excerpt=excerpt
                    )
                )

            summary = gemini_result.get("summary") or generate_summary_deterministically(paragraphs, title)
            key_entities = gemini_result.get("key_entities") or extract_entities_deterministically(request.source_text)

            return SourceAnalysisResponse(
                title=title,
                word_count=word_count,
                character_count=char_count,
                summary=summary,
                paragraphs=paragraphs,
                extracted_facts=extracted_facts,
                key_entities=key_entities
            )

    # Fallback / deterministic analysis
    extracted_facts = extract_facts_deterministically(paragraphs)
    summary = generate_summary_deterministically(paragraphs, title)
    key_entities = extract_entities_deterministically(request.source_text)

    return SourceAnalysisResponse(
        title=title,
        word_count=word_count,
        character_count=char_count,
        summary=summary,
        paragraphs=paragraphs,
        extracted_facts=extracted_facts,
        key_entities=key_entities
    )
