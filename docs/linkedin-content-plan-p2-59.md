# LinkedIn content plan (P2-59)

**Policy:** `linkedin-content-plan-p2-59-v1`  
**Updated:** 2026-06-16  
**Owner:** Founder (Dmytro)  
**Gap:** 3 posts/week founder-led organic LinkedIn

Supersedes the mixed company+founder cadence in [`linkedin-content-plan.md`](./linkedin-content-plan.md) for gap closure. Company page reshares optional — **founder profile is the primary channel**.

## Cadence — 3 posts/week founder-led

| Day | Time (local) | Pillar | Format | CTA |
|-----|--------------|--------|--------|-----|
| **Monday** | 08:30 | Operator clarity | Text | `/demo` |
| **Wednesday** | 12:00 | Honest AI | Carousel (3–5 slides) | `/ai` |
| **Friday** | 09:00 | Build in public + design partner | Text | `/book-demo` |

Canonical post templates: `lib/marketing/linkedin-content-plan-p2-59-content.ts`

## 4-week pillar rotation

| Week | Mon | Wed | Fri |
|:----:|-----|-----|-----|
| 1 | Operator clarity | Honest AI | Build in public |
| 2 | Integration reality | Operator clarity | Honest AI |
| 3 | Honest AI | Build in public | Integration reality |
| 4 | Build in public | Integration reality | Operator clarity |

## UTM discipline

All founder post links:

```
https://os-kitchen.com{path}?utm_source=linkedin&utm_medium=organic&utm_campaign={campaign}
```

| Campaign | Path |
|----------|------|
| `founder_operator_clarity` | `/demo` |
| `founder_honest_ai` | `/ai` |
| `founder_design_partner` | `/book-demo` |

## Honesty rules (founder-led)

- **0 signed founding customers** — state baseline in every design-partner post
- **BETA** / **SKIPPED** on integration screenshots — match Integration Health Center
- **Founder-led** voice — not corporate "trusted by thousands"
- **Building in public** — ship logs with LIVE/BETA labels from registry truth
- **Design partner** ask → hand off to [`design-partner-email-sequence-p2-58.md`](./design-partner-email-sequence-p2-58.md)

**Never post:** SOC 2 certified · all integrations LIVE · fake customer quotes · "AI-powered" without qualified module context.

Pre-publish:

```bash
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

Claims registry: [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

## Engagement playbook

| Action | Rule |
|--------|------|
| Reply to comments | < 4h business hours; no arguable claims |
| DM "partner" | Route to design partner email sequence step 1 |
| Competitor mentions | Factual only — [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) |
| Reshare company posts | Max 1× / week from founder profile |

## Measurement

| Cadence | Metric | Source |
|---------|--------|--------|
| Weekly | Impressions, clicks, DMs | LinkedIn analytics |
| Monthly | UTM campaign performance | GA4 `linkedin` source |
| Quarterly | Design partner conversations | CRM + [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json) |

## CI

```bash
npm run check:linkedin-content-plan-p2-59
```

## Artifact

`artifacts/linkedin-content-plan-p2-59.json`

## Related

| Doc | Use |
|-----|-----|
| [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) | Wednesday AI carousel source |
| [`design-partner-email-sequence-p2-58.md`](./design-partner-email-sequence-p2-58.md) | DM → email nurture |
| [`design-partner-outreach-meal-prep-p0-7.md`](./design-partner-outreach-meal-prep-p0-7.md) | ICP targeting |
