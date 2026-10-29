from fastapi.testclient import TestClient
from app.main import app
from app.utils.sample_data import SAMPLE_SOURCES

client = TestClient(app)

def test_samples_endpoints():
    response = client.get("/api/samples")
    assert response.status_code == 200
    samples = response.json()
    assert len(samples) >= 2
    assert "id" in samples[0]

def test_source_analyze_endpoint():
    payload = {
        "source_text": SAMPLE_SOURCES[0]["text"],
        "source_title": SAMPLE_SOURCES[0]["title"],
        "content_type": "case_study"
    }
    response = client.post("/api/source/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["word_count"] > 100
    assert len(data["paragraphs"]) > 0
    assert len(data["extracted_facts"]) > 0

def test_full_campaign_generation_lifecycle():
    sample = SAMPLE_SOURCES[0]
    payload = {
        "source_text": sample["text"],
        "source_title": sample["title"],
        "campaign_goal": sample["campaign_goal"],
        "target_audience": sample["target_audience"],
        "brand_voice": sample["brand_voice"],
        "keywords": sample["keywords"],
        "required_phrases": sample["required_phrases"],
        "prohibited_phrases": sample["prohibited_phrases"],
        "call_to_action": sample["call_to_action"],
        "selected_platforms": ["linkedin", "instagram_caption", "instagram_carousel", "short_video_script"]
    }

    # 1. Generate campaign
    gen_resp = client.post("/api/content/generate", json=payload)
    assert gen_resp.status_code == 200
    campaign = gen_resp.json()
    campaign_id = campaign["id"]
    assert campaign_id.startswith("cmp-")
    assert campaign["generated_content"]["linkedin"] is not None
    assert campaign["generated_content"]["instagram_caption"] is not None
    assert campaign["generated_content"]["instagram_carousel"] is not None
    assert campaign["generated_content"]["short_video_script"] is not None
    assert len(campaign["traceability_report"]) > 0

    # 2. Get campaign by ID
    get_resp = client.get(f"/api/campaigns/{campaign_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == campaign_id

    # 3. List campaigns
    list_resp = client.get("/api/campaigns")
    assert list_resp.status_code == 200
    ids = [c["id"] for c in list_resp.json()]
    assert campaign_id in ids

    # 4. Regenerate a single platform (e.g. linkedin)
    regen_payload = {
        "campaign_id": campaign_id,
        "platform": "linkedin",
        "source_text": sample["text"],
        "campaign_goal": sample["campaign_goal"],
        "target_audience": sample["target_audience"],
        "brand_voice": "Bold, punchy, direct",
        "key_messages": [],
        "keywords": sample["keywords"],
        "required_phrases": sample["required_phrases"],
        "prohibited_phrases": sample["prohibited_phrases"],
        "call_to_action": sample["call_to_action"],
        "custom_instruction": "Make the hook extra bold"
    }
    regen_resp = client.post("/api/content/regenerate-platform", json=regen_payload)
    assert regen_resp.status_code == 200
    updated_cmp = regen_resp.json()
    assert updated_cmp["id"] == campaign_id
    assert updated_cmp["generated_content"]["linkedin"] is not None
    # Ensure other platforms are still preserved
    assert updated_cmp["generated_content"]["instagram_carousel"] is not None

    # 5. Export formats
    for fmt in ["markdown", "json", "csv"]:
        exp_resp = client.get(f"/api/campaigns/{campaign_id}/export?format={fmt}")
        assert exp_resp.status_code == 200
        assert len(exp_resp.text) > 100
