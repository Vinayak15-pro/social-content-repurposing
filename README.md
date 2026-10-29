# RepurposeIQ — Social Content Repurposing Pipeline
> Transforming approved long-form case studies, blog posts, and product documentation into platform-specific social assets with verifiable **source-to-post factual traceability** and brand voice compliance.

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135.0-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38b2ac.svg)](https://tailwindcss.com)
[![Google GenAI SDK](https://img.shields.io/badge/google--genai-v2.33.0-4285F4.svg)](https://pypi.org/project/google-genai/)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-brightgreen.svg)]()

---

## Table of Contents
1. [Overview & Core Value](#1-overview--core-value)
2. [Signature Feature: Source-to-Post Traceability](#2-signature-feature-source-to-post-traceability)
3. [Technology Stack](#3-technology-stack)
4. [Project Architecture & Directory Structure](#4-project-architecture--directory-structure)
5. [Getting Started & Local Setup](#5-getting-started--local-setup)
   - [Prerequisites](#prerequisites)
   - [Backend Setup (FastAPI)](#backend-setup-fastapi)
   - [Frontend Setup (Next.js)](#frontend-setup-nextjs)
6. [Environment Variables](#6-environment-variables)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Automated Testing & QA](#8-automated-testing--qa)
9. [Platform Repurposing Capabilities](#9-platform-repurposing-capabilities)
10. [Brand Voice & Compliance Enforcement](#10-brand-voice--compliance-enforcement)
11. [Security & SSRF Mitigation](#11-security--ssrf-mitigation)
12. [AI Limitations, Privacy & Editorial Guidelines](#12-ai-limitations-privacy--editorial-guidelines)
13. [Troubleshooting Guide](#13-troubleshooting-guide)

---

## 1. Overview & Core Value

Marketing and growth engineering teams regularly publish high-value, fact-heavy long-form assets (whitepapers, customer case studies, technical teardowns, and architecture blogs). However, repurposing this material for social channels often leads to two major hazards:
1. **Factual drift and AI hallucinations**: LLMs frequently alter numbers, fabricate quotes, exaggerate percentages, or invent unsupported claims.
2. **Brand voice violations**: Social drafts accidentally omit mandatory compliance phrases (e.g. `SOC2 Type II certified`) or include forbidden buzzwords (e.g. `cheap`, `guaranteed 100%`).

**RepurposeIQ** solves this with a **ground-truth-first pipeline**:
- Ingests approved source texts via paste, safe public URL fetch, or sample templates.
- Extracts paragraph-level ground-truth facts, numbers, dates, and technical metrics.
- Repurposes content into four platform-native formats: **LinkedIn posts**, **Instagram captions**, **Instagram carousels**, and **Short-Video scripts (Reels/Shorts)**.
- Audits every single generated assertion against the source document, providing a split-panel **Traceability Workspace** where clicking any claim spotlights its exact verbatim source passage.
- Validates brand rules, required phrases, prohibited words, and preferred terminology.

> [!NOTE]
> RepurposeIQ assists human editors and compliance teams. It **never automatically publishes content to social media platforms**.

---

## 2. Signature Feature: Source-to-Post Traceability

The signature feature of RepurposeIQ is the **Traceability Audit Workspace** (Page D).

### The Four Verification Statuses
Every sentence and claim generated in an asset is classified into one of four distinct statuses:

| Status Badge | Color | Description |
| :--- | :--- | :--- |
| **Supported by Source** | Green | High textual & semantic alignment with ground-truth source paragraph. Metrics and numbers match verbatim. |
| **Partially Supported** | Amber | Concept is discussed in source, but figures, qualifiers, or scope differ slightly. Remediation guidance is provided. |
| **Not Found in Source** | Rose | Unsubstantiated extrapolation or claim not present in approved source. Flagged for editorial removal. |
| **Creative Suggestion — Not a Factual Claim** | Indigo | Stylistic opening hook, rhetorical question, emoji transition, or call to action. No factual verification required. |

### Interactive Split-Panel UI
- **Left Panel**: Directory of all generated claims across platforms with status badges, confidence meters, and location breadcrumbs.
- **Right Panel**: Active Claim Dossier detailing the audit finding, exact verbatim source excerpt, and an interactive Source Document Browser highlighting the cited paragraph in real time.

---

## 3. Technology Stack

### Frontend
- **Framework**: Next.js 15.5 App Router (React 19)
- **Language**: TypeScript 5.7 (strict typing)
- **Styling**: Tailwind CSS 3.4 (custom tokens, slate/indigo/emerald palette, Notion/Linear inspired SaaS aesthetic)
- **Icons**: Lucide React
- **HTTP Client**: Native fetch with typed API client layer

### Backend
- **Framework**: FastAPI 0.135.0 (ASGI)
- **Server**: Uvicorn 0.41.0
- **Validation**: Pydantic v2.14 & Pydantic Settings
- **AI SDK**: Official Google `google-genai` v2.33.0 Python SDK
- **Web Scraping**: BeautifulSoup4 & HTTPX (with SSRF protection)
- **Testing**: pytest 9.2, pytest-asyncio, FastAPI TestClient

---

## 4. Project Architecture & Directory Structure

```text
social-content-repurposing/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py             # FastAPI REST endpoints & in-memory campaign state
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py             # Environment config & Pydantic Settings
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── brand.py              # BrandGuidelines, BrandViolation schemas
│   │   │   ├── campaign.py           # Campaign, CampaignCreateRequest schemas
│   │   │   ├── content.py            # LinkedInPost, Carousel, VideoScript schemas
│   │   │   ├── source.py             # SourceParagraph, SourceFact schemas
│   │   │   └── traceability.py       # ClaimVerification, TraceabilityStatus schemas
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── brand_validator.py     # Deterministic & semantic brand compliance checker
│   │   │   ├── content_generator.py   # Multi-platform content adaptation engine
│   │   │   ├── gemini_service.py      # Google GenAI SDK integration with fallback
│   │   │   ├── source_analyzer.py     # Paragraph offset indexing & fact extraction
│   │   │   ├── traceability_checker.py# Source-to-claim lexical & semantic auditing
│   │   │   └── url_fetcher.py         # Safe web scraper with SSRF protection
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── exporter.py            # Markdown, JSON, and CSV export formatters
│   │   │   ├── sample_data.py         # Pre-loaded fintech & AI case studies
│   │   │   └── text_cleaner.py        # Paragraph parsing, offset mapper, word counter
│   │   ├── __init__.py
│   │   └── main.py                   # FastAPI initialization, CORS, global error handling
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_api_routes.py        # End-to-end API lifecycle tests
│   │   ├── test_brand_validator.py   # Brand compliance rule tests
│   │   ├── test_content_generator.py # Platform generation tests
│   │   ├── test_health.py            # Health check endpoint tests
│   │   ├── test_source_analyzer.py   # Paragraph splitting & fact extraction tests
│   │   ├── test_traceability.py      # Fact-checking & hallucination detection tests
│   │   ├── test_url_fetcher.py       # SSRF protection unit tests
│   │   └── verify_e2e.py             # Complete terminal verification script
│   ├── requirements.txt              # Backend dependencies
│   └── .env.example                  # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css           # Tailwind directives & design tokens
│   │   │   ├── layout.tsx            # HTML root metadata & layout
│   │   │   └── page.tsx              # App container & state coordinator
│   │   ├── components/
│   │   │   ├── brand/
│   │   │   │   └── BrandGuidelinesView.tsx  # Brand settings & active campaign audit
│   │   │   ├── content/
│   │   │   │   ├── GeneratedContentView.tsx # Tabs & platform preview router
│   │   │   │   ├── InstagramCaptionCard.tsx # Realistic Instagram post preview
│   │   │   │   ├── InstagramCarouselCard.tsx# Interactive carousel slide deck viewer
│   │   │   │   ├── LinkedInCard.tsx         # Realistic LinkedIn post preview & editor
│   │   │   │   └── ShortVideoScriptCard.tsx # Video storyboard timeline & narration
│   │   │   ├── create/
│   │   │   │   └── CreateCampaignView.tsx   # Source input, guardrails, platform cards
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardView.tsx        # Overview metrics & recent campaigns
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx               # Topbar, breadcrumbs, export dropdown
│   │   │   │   └── Sidebar.tsx              # Navigation & active campaign indicator
│   │   │   ├── library/
│   │   │   │   └── ContentLibraryView.tsx   # Catalog search, filter, export, delete
│   │   │   ├── settings/
│   │   │   │   └── SettingsView.tsx         # Backend & Gemini integration status
│   │   │   └── traceability/
│   │   │       └── TraceabilitySplitView.tsx# SIGNATURE FEATURE: Split-panel audit
│   │   ├── lib/
│   │   │   ├── api.ts                # Typed HTTP API client
│   │   │   └── utils.ts              # Tailwind merger & formatting utilities
│   │   └── types/
│   │       └── index.ts              # Shared TypeScript definitions
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── .env.example
├── sample_data/
│   ├── case_study_fintech.txt        # AuraPay 1.8M transaction migration case study
│   ├── product_launch_ai_agent.txt   # CortexSync 2.0 autonomous agent product page
│   └── blog_post_distributed_systems.md # Multi-Raft distributed storage technical blog
├── .gitignore
└── README.md
```

---

## 5. Getting Started & Local Setup

### Prerequisites
- **Python**: 3.10+ (tested with Python 3.14)
- **Node.js**: v18.0+ or v20.0+ (tested with Node.js v24.11)
- **Git**

### Backend Setup (FastAPI)

1. **Navigate to the backend directory**:
   ```powershell
   # Windows PowerShell
   cd backend
   ```
   ```bash
   # macOS / Linux
   cd backend
   ```

2. **Configure Environment Variables**:
   Copy the `.env.example` file to `.env`:
   ```powershell
   # Windows PowerShell
   Copy-Item .env.example .env
   ```
   ```bash
   # macOS / Linux
   cp .env.example .env
   ```

   *(Optional)* Add your Google Gemini API key into `backend/.env`:
   ```dotenv
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
   > **Note**: If no API key is specified, RepurposeIQ seamlessly runs in **Deterministic Ground-Truth Mode**, utilizing exact regex fact extraction and source paragraph mapping so you can test and use the application offline immediately.

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the FastAPI Server**:
   ```powershell
   # From the project root or backend folder
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend API will be live at `http://127.0.0.1:8000`. You can test it in your browser or view Swagger docs at `http://127.0.0.1:8000/docs`.

---

### Frontend Setup (Next.js)

1. **Open a new terminal window and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Configure Frontend Environment**:
   ```powershell
   # Windows PowerShell
   Copy-Item .env.example .env.local
   ```
   ```bash
   # macOS / Linux
   cp .env.example .env.local
   ```

3. **Install NPM Packages**:
   ```bash
   npm install
   ```

4. **Run the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   The application UI will be accessible at:
   👉 **`http://localhost:3000`**

---

## 6. Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key from Google AI Studio | *(Empty: runs in deterministic mode)* |
| `GEMINI_MODEL` | Gemini model identifier | `gemini-2.5-flash` |
| `PORT` | FastAPI server port | `8000` |
| `HOST` | FastAPI server host binding | `0.0.0.0` |
| `CORS_ORIGINS` | Permitted browser origins | `http://localhost:3000,http://127.0.0.1:3000` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the running FastAPI server | `http://127.0.0.1:8000` |

---

## 7. API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health, version, and Gemini client status |
| `GET` | `/api/samples` | Retrieves pre-baked sample case studies and technical articles |
| `POST` | `/api/source/analyze` | Ingests raw source text, splits into paragraphs with offsets, and extracts facts |
| `POST` | `/api/source/fetch-url` | Safely retrieves webpage text with SSRF protection |
| `POST` | `/api/content/generate` | Generates social assets, audits claims, validates brand rules, and saves campaign |
| `POST` | `/api/content/regenerate-platform` | Regenerates a single platform draft preserving other assets |
| `POST` | `/api/content/verify` | Audits a single user-edited claim against source text |
| `GET` | `/api/campaigns` | Lists all created campaigns (sorted newest first) |
| `GET` | `/api/campaigns/{id}` | Retrieves full campaign details, drafts, and audit reports |
| `PUT` | `/api/campaigns/{id}` | Persists manual user edits to drafts |
| `DELETE` | `/api/campaigns/{id}` | Deletes a campaign from storage |
| `GET` | `/api/campaigns/{id}/export?format=markdown` | Exports campaign summary, drafts, and audits as Markdown |
| `GET` | `/api/campaigns/{id}/export?format=json` | Exports complete campaign payload as JSON |
| `GET` | `/api/campaigns/{id}/export?format=csv` | Exports full claims traceability matrix as CSV |
| `GET` | `/api/brand-guidelines` | Retrieves corporate brand guidelines and compliance rules |
| `PUT` | `/api/brand-guidelines` | Updates corporate brand guidelines |

---

## 8. Automated Testing & QA

### Run Backend Pytest Suite
From the root workspace, run:
```bash
python -m pytest backend/tests -v
```

Expected output:
```text
backend/tests/test_api_routes.py::test_samples_endpoints PASSED
backend/tests/test_api_routes.py::test_source_analyze_endpoint PASSED
backend/tests/test_api_routes.py::test_full_campaign_generation_lifecycle PASSED
backend/tests/test_brand_validator.py::test_brand_validator_catches_prohibited_words PASSED
backend/tests/test_brand_validator.py::test_brand_validator_clean_content PASSED
backend/tests/test_content_generator.py::test_platform_content_generation PASSED
backend/tests/test_health.py::test_health_endpoint PASSED
backend/tests/test_source_analyzer.py::test_split_into_paragraphs_and_offsets PASSED
backend/tests/test_source_analyzer.py::test_word_count PASSED
backend/tests/test_source_analyzer.py::test_source_analysis_fact_extraction PASSED
backend/tests/test_traceability.py::test_traceability_supported_and_creative_statuses PASSED
backend/tests/test_traceability.py::test_traceability_detects_unsupported_claim PASSED
backend/tests/test_traceability.py::test_traceability_detects_creative_suggestion PASSED
backend/tests/test_url_fetcher.py::test_url_fetcher_blocks_localhost PASSED
backend/tests/test_url_fetcher.py::test_url_fetcher_blocks_loopback_ip PASSED
backend/tests/test_url_fetcher.py::test_url_fetcher_blocks_invalid_schemes PASSED
backend/tests/test_url_fetcher.py::test_url_fetcher_blocks_file_scheme PASSED

======================= 17 passed in 1.72s =======================
```

### Run End-to-End Terminal Verification Script
```bash
python backend/tests/verify_e2e.py
```

### Run Frontend Production Build & TypeScript Verification
```bash
cd frontend
npm run build
```

---

## 9. Platform Repurposing Capabilities

### 1. LinkedIn Post
- **Opening Hook**: Thought leadership hook calibrated to stop tech executives scrolling.
- **Engaging Body**: Spaced, readable paragraphs highlighting concrete outcomes, architectural decisions, and key lessons.
- **Hashtags & CTA**: Curated relevant technical hashtags (`#CloudArchitecture`, `#Fintech`, `#SoftwareEngineering`) and explicit call to action.
- **Interactive UI**: Includes feed preview mode with "see more" expansion and instant text editor with character and read time indicators.

### 2. Instagram Caption
- **Hook & Visual Pairing**: Designed to accompany carousel posts or technical graphics.
- **Bulleted Takeaways**: Bullet points highlighting quantifiable metrics.
- **Community CTA**: Prompts engagement and directs users to bio link.

### 3. Instagram Carousel
- **Slide Deck Breakdown**: 5 to 7 structured slides with sequential numbering.
- **Slide Titles & Body**: Bite-sized copy per slide.
- **Visual Art Direction**: Explicit design notes for graphic designers (e.g., *"Architecture block diagram showing Kafka event mesh routing to containerized microservices"*).
- **Interactive Deck Viewer**: Interactive carousel in the UI allowing editors to click through slides with arrow buttons.

### 4. Short-Video Script (Reels / Shorts / TikTok)
- **3-Second Hook**: Verbal and visual hook to prevent swipe-away.
- **Runtime Optimization**: Formatted for 30s-60s short-form videos.
- **Multi-Track Scene Breakdown**:
  - `Timestamp Range` (e.g. `0:00 - 0:05`, `0:05 - 0:15`)
  - `Spoken Narration` (exact words for the speaker or voiceover)
  - `On-Screen Text` (bold kinetic typography cues)
  - `Visuals & B-Roll` (exact footage or camera directions)

---

## 10. Brand Voice & Compliance Enforcement

RepurposeIQ enforces consistency between marketing copy and legal/brand requirements:

1. **Mandatory Required Phrases**: Ensures critical compliance terms (e.g. `SOC2 Type II certified`, `enterprise-ready`) are included. Missing terms trigger actionable warnings.
2. **Prohibited Buzzwords**: Catches disallowed hype terms (e.g. `cheap`, `miracle`, `silver bullet`, `guaranteed 100%`) and highlights the exact passage with approved replacements.
3. **Preferred Terminology**: Automatically flags deprecated vocabulary and recommends brand-approved substitutes (e.g., replaces `customer` with `client partner`, or `bot` with `AI automation agent`).
4. **Unsupported Superlatives**: Identifies unsubstantiated claims (e.g., `#1 fastest in the universe`) that could create commercial liability.

---

## 11. Security & SSRF Mitigation

For public URL ingestion, RepurposeIQ applies rigorous **Server-Side Request Forgery (SSRF)** protections:
- **Strict Scheme Validation**: Only `http://` and `https://` URLs are accepted. `ftp://`, `file://`, and local protocols are immediately rejected.
- **DNS Resolution & IP Inspection**: Resolves destination hostnames and blocks connections to loopback (`127.0.0.0/8`, `::1`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and link-local ranges (`169.254.0.0/16`).
- **Download Limits & Timeouts**: Requests time out after 10 seconds and reject payloads exceeding 5MB to prevent denial-of-service.
- **Post-Redirect Validation**: Validates redirect target URLs against the same IP security filters.
- **Safe HTML Sanitization**: Automatically strips scripts, embedded iframes, SVG, and styles before extracting readable article text.

---

## 12. AI Limitations, Privacy & Editorial Guidelines

1. **Human-in-the-Loop Requirement**: RepurposeIQ is an editorial co-pilot. Generated drafts and fact-verification scores provide structured assistance to editors, but do not replace human editorial sign-off.
2. **No Automatic Publishing**: The application has no connection to social media posting APIs and will never publish content automatically.
3. **Data Privacy**: No user content is permanently stored outside your local workspace or sent to third-party databases. When using the official Google GenAI SDK, your content is processed in accordance with your Google Cloud / Google AI Studio API privacy terms.

---

## 13. Troubleshooting Guide

### Backend Connection Issues
- **Error**: `Cannot reach backend server at http://127.0.0.1:8000`
- **Solution**: Ensure the FastAPI server is running (`python -m uvicorn app.main:app --port 8000 --reload`). Check that port 8000 is not blocked by a firewall.

### URL Fetching Fails
- **Error**: `Access to private or local network address is prohibited`
- **Solution**: RepurposeIQ intentionally blocks localhost (`127.0.0.1`) and internal LAN addresses for security. Use public URLs or paste the text directly into the "Paste Content" tab.

### Gemini API Key Issues
- **Error**: API reports fallback to deterministic mode
- **Solution**: Check `backend/.env`. Ensure `GEMINI_API_KEY` is set without quotation marks or extra spaces. Run `GET /health` to verify status. Note that the application will run seamlessly with full traceability in deterministic mode even without an API key!
