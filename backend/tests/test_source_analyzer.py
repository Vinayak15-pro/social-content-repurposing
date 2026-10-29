from app.models.source import SourceAnalysisRequest
from app.services.source_analyzer import analyze_source_content
from app.utils.text_cleaner import split_into_paragraphs, count_words

def test_split_into_paragraphs_and_offsets():
    raw = "Heading 1\n\nFirst paragraph here with some text.\n\nSecond paragraph here with 42% improvements."
    paras = split_into_paragraphs(raw)
    assert len(paras) >= 2
    assert paras[0].index == 0
    assert paras[1].index == 1
    assert paras[0].char_start >= 0
    assert paras[1].char_end > paras[1].char_start

def test_word_count():
    text = "The quick brown fox jumps over the lazy dog."
    assert count_words(text) == 9

def test_source_analysis_fact_extraction():
    sample_text = """# Fintech Platform Case Study
    
    AuraPay processed 1.8 million daily card transactions before migrating to AWS.
    P99 payment latency dropped from 2,400ms down to 180ms, a 92.5% reduction.
    Operating costs dropped by 42%, saving $1.4 million annually.
    The system is enterprise-ready and SOC2 Type II certified."""
    
    req = SourceAnalysisRequest(source_text=sample_text, source_title="AuraPay Study")
    result = analyze_source_content(req)
    
    assert result.title == "AuraPay Study"
    assert result.word_count > 20
    assert len(result.paragraphs) > 0
    assert len(result.extracted_facts) > 0
    
    # Check that facts have valid source paragraph indices and non-empty excerpts
    for fact in result.extracted_facts:
        assert fact.source_paragraph_index >= 0
        assert len(fact.source_excerpt) > 0
        assert fact.source_excerpt in result.paragraphs[fact.source_paragraph_index].text or fact.fact in result.paragraphs[fact.source_paragraph_index].text

