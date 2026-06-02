# AI honesty policy — OS Kitchen

**Policy:** `ai-honesty-policy-v1`  
**Effective:** 2026-06-02  
**Owner:** Founder + Product + Legal (review)  
**Audience:** **Public** — customers, prospects, partners, press, investors  
**Status:** Active · applies to product UI, marketing, sales, and support

OS Kitchen publishes this policy so operators know **what our AI features do, what they do not do, and how we label maturity**. We ship seven proprietary AI modules in one platform — we do **not** claim autonomous AGI, guaranteed outcomes, or live computer vision by default.

**Internal playbooks:** [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) · [`kitchen-camera-honest-positioning.md`](./kitchen-camera-honest-positioning.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

**Enforcement:** `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` · [`tests/unit/forbidden-claims-enforcement.test.ts`](../tests/unit/forbidden-claims-enforcement.test.ts)

---

## Our commitment

| We commit to | We do not commit to |
|--------------|---------------------|
| Label AI features with honest maturity (BETA, pilot_ready, preview) | Hiding preview/synthetic modes in demos |
| Explain when outputs are **deterministic** (rules + data) vs optional LLM assist | Calling rule-based alerts "magic AI" |
| Show Integration Health and SKIPPED proof states | Marking integrations LIVE without smoke PASS |
| Human approval gates on purchasing and high-impact actions | Fully autonomous operations |
| Correct public materials when we overclaim | Defending outdated marketing after audit |

**June 2026 context:** OS Kitchen is **pre-revenue** with **zero signed design partners** on record. AI modules are **engineering-shipped**; operator proof is **in progress** — not complete.

---

## Scope — seven AI modules

| # | Module | What it helps with | Default maturity |
|---|--------|-------------------|------------------|
| 1 | **AI Restaurant Brain** | Daily briefing, alerts on `/dashboard/today` | pilot_ready |
| 2 | **Digital Twin** | Station load simulation | BETA |
| 3 | **Universal Menu Engine** | Cross-channel menu structure | BETA |
| 4 | **Food Cost AI** | Recipe costing and margin alerts | pilot_ready |
| 5 | **AI Purchasing** | Reorder suggestions with **approval gate** | BETA |
| 6 | **Kitchen Camera AI** | Camera-ready stations + detection modules | BETA / **preview default** |
| 7 | **Benchmark Network** | Anonymized cohort comparisons | BETA |

Detailed per-module limits: [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md)

---

## Principles

### 1 — Deterministic first

Most OS Kitchen AI outputs are built from **your workspace data** — orders, recipes, inventory, KDS signals — using structured logic and math. Optional copilot/chat features may use third-party language models when configured; **core operational briefings do not require GPT** to function.

### 2 — Human in the loop

| Feature | Automation | Human decision |
|---------|------------|----------------|
| AI Purchasing | Suggests reorder quantities | Buyer approves PO |
| Daily briefing | Surfaces priorities | Operator acts or dismisses |
| Food cost alerts | Flags margin drift | Manager adjusts recipes/pricing |
| Kitchen camera modules | May infer station load | Staff verify before operational reliance |

We do **not** auto-execute financial, procurement, or safety-critical actions without explicit approval where the product provides a gate.

### 3 — Maturity labels in product

OS Kitchen shows **BETA**, **PLACEHOLDER**, **SKIPPED**, and preview banners in UI — not only in footnotes. Examples:

- Integration Health rows for channel connectors  
- Amber **Preview mode — no live camera connected** on Kitchen Camera (`KITCHEN_CAMERA_SYNTHETIC`)  
- SKIPPED staging proof banners on Today when artifacts require it  

Sales and support must **not** ask customers to ignore these labels.

### 4 — No outcome guarantees

OS Kitchen does **not** guarantee:

- Revenue, margin, waste, or labor savings percentages  
- Order accuracy or rush-hour performance without your operational baseline  
- Food safety or health department compliance via AI  
- Benchmark rankings as industry-certified truth  

ROI figures on marketing pages are **illustrative** unless tied to a **named, approved case study**.

### 5 — Data and privacy

| Topic | Policy |
|-------|--------|
| **Training on customer data** | OS Kitchen does **not** use your operational data to train foundation models for other tenants without explicit agreement |
| **Benchmark Network** | Contributes **anonymized aggregates** only when opted in — no raw PII in cohort exports |
| **Third-party AI APIs** | Optional features may send prompts to configured providers — disclose in DPA/subprocessor list |
| **Retention** | Follows workspace settings and DPA — see [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) |

### 6 — Optional OpenAI / LLM features

When enabled, copilot and generative helpers may call external models. Outputs can be **incorrect or incomplete**. Operators must verify before acting. LLM features are **assistive**, not authoritative for compliance or accounting.

---

## Module-specific public disclosures

### AI Restaurant Brain

- Produces a **deterministic daily briefing** from hub, integration, and ops signals.  
- **Not** an autonomous manager and **not** a substitute for staff judgment.  
- Email/SMS delivery requires configured providers (Resend/Twilio).

### Digital Twin

- **Simulation** for planning — not a real-time physical twin of your kitchen layout.  
- Rush-hour certification **not** claimed.

### Universal Menu Engine

- Menu model and sync hooks — channel sync maturity follows **each integration's BETA/LIVE status**.  
- **Not** guaranteed bidirectional inventory across all channels.

### Food Cost AI

- Depends on accurate recipes, yields, and receiving data you maintain.  
- **Not** tax, accounting, or audit advice.

### AI Purchasing

- EOQ-style math and usage signals — **recommendations only**.  
- Purchase orders require **human approval** in product flows.

### Kitchen Camera AI

**Headline:** *Camera-ready platform with configurable detection modules.*

- **Default:** preview mode with honesty banner when no live stream is connected.  
- Live computer vision requires configured stream URL + validated detection path.  
- **Not** food safety certification or health-inspector replacement.

Full detail: [`kitchen-camera-honest-positioning.md`](./kitchen-camera-honest-positioning.md)

### Benchmark Network

- Comparisons require sufficient anonymized cohort size — early deployments may show **limited or illustrative** benchmarks.  
- **Not** third-party audited industry rankings.

---

## Approved public language

| Phrase | Required qualifier |
|--------|-------------------|
| "7 proprietary AI modules in production" | "Each at qualified maturity — pilot proof in progress" |
| "AI-assisted operations hub" | Point to Today Command Center + specific module |
| "Deterministic daily briefing" | Restaurant Brain only |
| "Camera-ready platform" | Preview mode until stream configured |
| "Human-in-the-loop purchasing recommendations" | Approval gate visible |

---

## Forbidden public language

These phrases are **blocked in CI** and must not appear in marketing, sales decks, or contracts without Legal review:

| Forbidden | Why |
|-----------|-----|
| "Untouchable" / "unbeatable AI moat" | Unverifiable superlative |
| "Fully autonomous restaurant AI" | Misrepresents human-in-the-loop design |
| "Guaranteed savings" / "100% accurate" / "always correct" | Outcome guarantee |
| "Live AI vision on all stations" | Default is preview/synthetic |
| "Production-certified AI for all tenants" | Per-module, per-tenant maturity varies |
| "AGI" / "replaces your manager" | False autonomy claim |

Also forbidden: affirming **production SSO**, **SOC 2 Type II certified**, **live marketplace network**, **offline POS ready**, **rush-hour KDS certified** — see [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md).

Run before publish: `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`

---

## Roles and accountability

| Role | Responsibility |
|------|----------------|
| **Product** | Maturity labels accurate in UI; preview banners not removable in dishonest demos |
| **Engineering** | Forbidden-claims CI green on `main`; feature flags documented |
| **Marketing** | Public copy passes `verify-claims`; illustrative stats labeled |
| **Sales** | [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) on every first close |
| **CS** | No upgrading LIVE/BETA labels in customer email ([`customer-success-playbook.md`](./customer-success-playbook.md)) |
| **Founder** | Policy updates + incident comms if AI overclaim surfaces |

---

## When we get it wrong

If OS Kitchen publishes an incorrect AI claim:

1. **Correct** the surface within **5 business days** (web, deck, or in-app copy).  
2. **Notify** affected prospects/customers if they received the incorrect claim in writing.  
3. **Log** root cause in release notes or internal post-mortem.  
4. **Add** CI phrase block if repeatable.

Crisis template (Task 112): [`ai-crisis-communication-template.md`](./ai-crisis-communication-template.md) when created.

---

## Demos and media

| Rule | Detail |
|------|--------|
| Show preview banners | Kitchen Camera amber bar stays visible |
| Show BETA badges | Integration Health in Today demo |
| Do not use stock photos as "AI detections" | Product screenshots or labeled synthetic |
| Recordings | Match [`demo-video-script-today.md`](./demo-video-script-today.md) honesty script |

Demo environment: [`sales-demo-environment.md`](./sales-demo-environment.md)

---

## Pilot and design partners

Design partners receive **module scope in LOI Exhibit A** — not all seven modules are LIVE for every workflow. Pilot metrics do **not** automatically become public case studies. Written approval required.

Pilot gates: [`pilot-acceptance-criteria.md`](./pilot-acceptance-criteria.md) · current GO/NO-GO: [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json)

---

## Policy updates

| Version | Date | Change |
|---------|------|--------|
| `ai-honesty-policy-v1` | 2026-06-02 | Initial public policy — Task 100 |

Material changes require Founder sign-off and `verify-claims` PASS on affected pages.

**Suggested public URL:** `/legal/ai-honesty` (page to be wired in marketing backlog)

---

## Contact

Questions about this policy or a potentially incorrect claim:

- **Email:** support channel listed on `/contact` or in-app Support  
- **Security / data:** see `/legal/security`  
- **Press:** Founder review before quoting AI capabilities

---

## Related documents

| Document | Audience |
|----------|----------|
| [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) | Sales + GTM internal |
| [`kitchen-camera-honest-positioning.md`](./kitchen-camera-honest-positioning.md) | Moat #6 |
| [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) | Sales training |
| [`series-a-narrative.md`](./series-a-narrative.md) | Investor honesty |
| [`marketing/forbidden-claims-training.md`](../marketing/forbidden-claims-training.md) | Pre-demo checklist |

---

*Generated as Task 100 — P2 PM. Next: competitor feature tracker fill (Task 101).*
