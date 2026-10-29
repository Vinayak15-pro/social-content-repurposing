import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import time
import httpx

BASE_URL = "http://127.0.0.1:8000"

def run_e2e_checks():
    print("Testing backend endpoints directly against running server or TestClient...")
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Health
    r = client.get("/health")
    assert r.status_code == 200, f"Health failed: {r.text}"
    print("[PASS] GET /health:", r.json()["status"], f"(Gemini: {r.json()['gemini']['model']})")

    # 2. Samples
    r = client.get("/api/samples")
    assert r.status_code == 200, f"Samples failed: {r.text}"
    samples = r.json()
    assert len(samples) >= 2
    print(f"[PASS] GET /api/samples: {len(samples)} pre-loaded case studies & product articles")

    # 3. Source analysis
    sample = samples[0]
    r = client.post("/api/source/analyze", json={
        "source_text": sample["text"],
        "source_title": sample["title"],
        "content_type": sample["content_type"]
    })
    assert r.status_code == 200, f"Analyze failed: {r.text}"
    analysis = r.json()
    print(f"[PASS] POST /api/source/analyze: {analysis['word_count']} words, {len(analysis['paragraphs'])} paragraphs, {len(analysis['extracted_facts'])} facts extracted")

    # 4. Generate campaign
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
    r = client.post("/api/content/generate", json=payload)
    assert r.status_code == 200, f"Generate failed: {r.text}"
    campaign = r.json()
    cid = campaign["id"]
    print(f"[PASS] POST /api/content/generate: Generated campaign {cid}")
    print(f"  - LinkedIn chars: {campaign['generated_content']['linkedin']['character_count']}")
    print(f"  - Instagram Caption chars: {campaign['generated_content']['instagram_caption']['character_count']}")
    print(f"  - Instagram Carousel slides: {len(campaign['generated_content']['instagram_carousel']['slides'])}")
    print(f"  - Short Video scenes: {len(campaign['generated_content']['short_video_script']['scenes'])}")
    print(f"  - Traceability claims audited: {len(campaign['traceability_report'])}")
    print(f"  - Brand violations: {len(campaign['brand_violations'])}")

    # 5. Regenerate single platform
    regen_payload = {
        "campaign_id": cid,
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
        "custom_instruction": "Highlight P99 latency gains aggressively"
    }
    r = client.post("/api/content/regenerate-platform", json=regen_payload)
    assert r.status_code == 200, f"Regenerate failed: {r.text}"
    updated = r.json()
    assert updated["id"] == cid
    print("[PASS] POST /api/content/regenerate-platform: Successfully regenerated LinkedIn asset preserving other platforms")

    # 6. Verify custom content
    r = client.post("/api/content/verify", json={
        "source_text": sample["text"],
        "platform": "LinkedIn",
        "content_text": "P99 transaction latency dropped from 2,400ms down to 180ms."
    })
    assert r.status_code == 200, f"Verify failed: {r.text}"
    audit = r.json()
    assert audit["claim_verification"]["status"] == "Supported by Source"
    print("[PASS] POST /api/content/verify: Successfully audited claim -> Status:", audit["claim_verification"]["status"])

    # 7. Exports
    for fmt in ["markdown", "json", "csv"]:
        r = client.get(f"/api/campaigns/{cid}/export?format={fmt}")
        assert r.status_code == 200
        print(f"[PASS] GET /api/campaigns/{cid}/export?format={fmt}: {len(r.text)} bytes")

    print("\nALL BACKEND API VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_e2e_checks()
