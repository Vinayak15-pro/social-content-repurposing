from typing import List, Dict, Any

SAMPLE_SOURCES: List[Dict[str, Any]] = [
    {
        "id": "sample-fintech-case-study",
        "title": "AuraPay Case Study: Zero-Downtime Migration of 1.8M Daily Transactions to Event-Driven Cloud Architecture",
        "content_type": "case_study",
        "campaign_goal": "Lead Generation for Enterprise Financial Services",
        "target_audience": "Fintech CTOs, VP Engineering, and Chief Architecture Officers",
        "brand_voice": "Authoritative, metrics-driven, enterprise-focused",
        "keywords": ["Fintech", "Cloud Migration", "Zero-Downtime", "SOC2 Type II", "Event-Driven", "P99 Latency"],
        "required_phrases": ["enterprise-ready", "SOC2 Type II certified", "zero-downtime"],
        "prohibited_phrases": ["cheap", "effortless", "silver bullet", "guaranteed 100%"],
        "call_to_action": "Read the full engineering whitepaper to explore AuraPay's migration architecture",
        "text": """# AuraPay Engineering Case Study: High-Scale Cloud Modernization

### Executive Summary
AuraPay is a tier-1 digital payments platform serving over 4.2 million active merchant accounts across North America and Europe. In Q3 2024, AuraPay completed a landmark modernization initiative: migrating their monolithic core processing engine to an event-driven microservices architecture hosted on multi-region AWS and Kubernetes.

### The Challenge: Monolithic Bottlenecks at Scale
Before the initiative, AuraPay processed approximately 1.8 million daily card transactions, with holiday peak volumes surging to 6,200 transactions per second (TPS). The legacy Java monolith ran on managed relational databases with severe locking contention. P99 payment latency frequently degraded to 2.4 seconds during traffic spikes, and scheduled database maintenance windows required 45 minutes of scheduled downtime every month. Furthermore, compliance audits against PCI-DSS Level 1 and SOC2 Type II required weeks of manual validation due to lack of audit trail isolation.

### The Modernization Strategy
Over an 8-month period, AuraPay's platform team partnered with CloudScale Architects to re-architect transaction routing. The new architecture decoupled authorization from settlement using an asynchronous event mesh built on Apache Kafka, with persistent storage backed by distributed multi-region CockroachDB. Every microservice was containerized, deployed across three independent AWS availability zones, and governed by strict mutual TLS (mTLS) with automated certificate rotation.

### Key Measurable Outcomes
The cutover was executed over a 6-week phased rollout using canary routing with zero customer-facing downtime. Final production benchmarks demonstrated:
1. Infrastructure operating costs decreased by 42%, saving $1.4 million annually.
2. P99 transaction latency dropped from 2,400ms down to 180ms, representing a 92.5% latency improvement.
3. Sustained throughput scaled to 18,500 TPS during Black Friday 2024 without a single failed authorization queue.
4. Deployment frequency increased from bi-weekly releases to an average of 14 production deployments per day.
5. Achieved full SOC2 Type II certified compliance and continuous automated PCI-DSS audit posture.

### Architecture Highlights & Lessons Learned
The engineering leadership emphasized three core takeaways for peer financial institutions:
First, never attempt a 'big-bang' cutover on transaction rails. By using shadow traffic replay for 90 consecutive days, the team identified 17 edge-case idempotency bugs before handling live customer funds. Second, strict schema governance in Protobuf prevented backward compatibility breaks across 38 microservices. Finally, establishing automated circuit-breakers and adaptive rate-limiting protected downstream card networks during unpredictable partner API outages."""
    },
    {
        "id": "sample-ai-agent-launch",
        "title": "Introducing CortexSync: Autonomous Customer Workflow Agent for Enterprise B2B SaaS",
        "content_type": "product_page",
        "campaign_goal": "Product Awareness & Demo Bookings",
        "target_audience": "VP of Customer Experience, Chief Customer Officers, and Support Operations Leaders",
        "brand_voice": "Visionary, clear, trusted, customer-centric",
        "keywords": ["AI Agents", "Customer Experience", "Resolution Time", "Enterprise SaaS", "Human-in-the-Loop"],
        "required_phrases": ["enterprise-ready", "SOC2 Type II certified"],
        "prohibited_phrases": ["cheap", "miracle", "replaces all humans"],
        "call_to_action": "Request a personalized sandbox demo with your team's real tickets",
        "text": """# Announcing CortexSync 2.0: The Reliable Enterprise AI Agent

Modern customer experience teams are overwhelmed by ticket volumes, repetitive API triage, and disparate knowledge silos. Traditional conversational bots deflect simple FAQs but break down when asked to execute multi-step workflows like issuing refunds, verifying contract entitlements, or re-routing urgent infrastructure alerts.

### Designed for Enterprise Operations
CortexSync is built from the ground up for high-complexity customer environments. Rather than acting as a simple text chatbot, CortexSync combines structured reasoning engines with 40+ pre-built integrations into Salesforce, Zendesk, Jira, Stripe, and Datadog.

Key Capabilities:
- Autonomous Action Execution: CortexSync safely inspects customer account state, triggers webhook operations, and drafts responses with complete audit logging.
- Human-in-the-Loop Safeguards: Configurable confidence thresholds ensure that any action involving financial adjustments over $250 or contract modifications requires one-click agent approval.
- Verified Enterprise Security: CortexSync is enterprise-ready, SOC2 Type II certified, and guarantees that customer data is never used to train third-party public models.
- Fast Time to Value: Integration takes under 14 business days, requiring zero custom Python scripting or deep model fine-tuning.

### Production Results in Beta
During our private beta across 28 global enterprise customers:
- Average first-response time decreased from 47 minutes to 28 seconds.
- Mean time to resolution (MTTR) dropped by 64% across tier-1 and tier-2 support queues.
- Over 340,000 inquiries were resolved autonomously with an overall CSAT score of 4.8 out of 5.0."""
    }
]

def get_sample_by_id(sample_id: str) -> Dict[str, Any]:
    for sample in SAMPLE_SOURCES:
        if sample["id"] == sample_id:
            return sample
    return SAMPLE_SOURCES[0]

