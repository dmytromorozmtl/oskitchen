# Release notes process

**Policy:** `release-notes-process-v1`  
**Updated:** 2026-06-02  
**Owner:** PM + Engineering (publish) · Founder (claims gate on major releases)  
**Public surface:** [`/changelog`](../app/changelog/page.tsx) · **Authoring:** `/dashboard/developer/releases`  
**Related:** [`CHANGELOG_RELEASE_NOTES_FINAL.md`](./CHANGELOG_RELEASE_NOTES_FINAL.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`migration-deployment-process.md`](./migration-deployment-process.md)

This process defines **how OS Kitchen ships, reviews, and publishes release notes** — from merged PR to public `/changelog`, in-app banner, and optional customer comms.

**Honesty rule:** Release notes are **not** marketing copy. Every bullet must match shipped code or an explicit **Known limitations** section. BETA features require caveat language per the sales-safe claims registry.

---

## Artifact map

| Artifact | Path | Audience | Updated when |
|----------|------|----------|--------------|
| **Public changelog** | `/changelog` ← `ReleaseNote` rows (`published: true`) | Prospects, customers, support | Each publish from Developer → Releases |
| **Engineering log** | [`CHANGELOG.md`](../CHANGELOG.md) | Engineering, ops | Major deploys, pilot milestones, security fixes |
| **Static fallback** | `app/changelog/page.tsx` | Public when DB empty | Rare — foundation summary only |
| **In-app banner** | `components/dashboard/changelog-banner.tsx` ← `lib/changelog/releases.ts` | Logged-in operators | Manual bump to `STATIC_RELEASES[0]` (see gap below) |
| **Runtime label** | `lib/version.ts` → `APP_VERSION` | Developer UI, support tickets | Beta milestone bump |

**Known gap (June 2026):** Dashboard banner reads **static** `STATIC_RELEASES`, not DB `ReleaseNote`. After publishing to `/changelog`, also update `lib/changelog/releases.ts` if operators should see the banner — or accept banner lag until wired.

---

## Release cadence

| Type | Frequency | Example | Public note? |
|------|-----------|---------|:------------:|
| **Hotfix** | As needed | Security patch, P0 bug | Yes — within 24h |
| **Pilot deploy** | Weekly–biweekly during pilot | Staging → prod promote | Yes — summary + known issues |
| **Feature batch** | When milestone closes | Marketplace catalog filters | Yes — grouped under one version |
| **Internal-only** | Any time | Cron manifest, refactors | `CHANGELOG.md` only — no public note unless user-visible |

Do **not** publish empty “maintenance release” notes. Batch minor fixes into the next scheduled note or list under **Improved** / **Fixed**.

---

## Version labeling

| Field | Convention | Example |
|-------|------------|---------|
| **`APP_VERSION`** (`lib/version.ts`) | Semver + `-beta` during pilot | `0.2.0-beta` |
| **ReleaseNote.version** | Same as or finer than `APP_VERSION` | `0.2.1-beta` · `2026.06.02-marketplace` |
| **ReleaseNote.slug** | Lowercase kebab, unique | `june-2026-marketplace-filters` |
| **Deploy tag** (optional) | Git tag on prod SHA | `v0.2.1-beta` |

Bump `APP_VERSION` on **beta milestones** (pilot week close, major module GA), not every PR.

---

## Roles & RACI

| Step | PM | Engineering | Founder | CS / Support |
|------|:--:|:-----------:|:-------:|:--------------:|
| Collect shipped items from PRs | R | C | I | I |
| Draft `ReleaseNote` | A | R | I | C |
| Claims / honesty review | C | C | A | I |
| Publish to `/changelog` | C | R | I | I |
| Update `CHANGELOG.md` (major) | C | R | I | I |
| Update `STATIC_RELEASES` (banner) | I | R | — | I |
| Notify design partners / beta | A | I | C | R |

R = responsible · A = accountable · C = consulted · I = informed

---

## End-to-end workflow

```mermaid
flowchart TD
  A[PR merged + deployed] --> B{User-visible?}
  B -->|No| C[CHANGELOG.md only]
  B -->|Yes| D[Draft at /dashboard/developer/releases]
  D --> E[Claims review]
  E --> F{Pass?}
  F -->|No| D
  F -->|Yes| G[Publish ReleaseNote]
  G --> H[/changelog live]
  G --> I[Optional: STATIC_RELEASES + APP_VERSION]
  G --> J[Optional: beta email / in-app]
  C --> K[Record deploy in CHANGELOG]
```

### Step 1 — Collect (Engineering + PM)

Within 48h of prod deploy, gather:

- Merged PR titles / labels (`feat`, `fix`, `security`)
- Migration folders applied ([`migration-deployment-process.md`](./migration-deployment-process.md))
- Integration status changes (BETA → LIVE only with DoD sign-off)
- Known regressions or ops follow-ups

Source: GitHub merge queue, `artifacts/execution-log.txt` (122-task cycles), deploy notifications.

### Step 2 — Draft (Developer → Releases)

Route: **`/dashboard/developer/releases`** (requires developer-center access via `requireDeveloperCenterAccess`).

| Field | Guidance |
|-------|----------|
| **Title** | Operator-facing headline — not internal codename |
| **Slug** | Unique URL fragment; auto-normalized in `createDraftReleaseNote` |
| **Version label** | Align with `APP_VERSION` or patch suffix |
| **Summary** | 1–2 sentences for `/changelog` list view |
| **Content** | Full body — use template below |

Actions: `submitDraftReleaseNoteForm` → `published: false` until explicit publish.

### Step 3 — Claims review (required before publish)

Check every bullet against [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md):

| Verdict in note | Allowed wording |
|-----------------|-----------------|
| Shipped feature | **New** / **Improved** — match YES or ONLY_WITH_CAVEAT registry row |
| Partial / BETA | **New** + caveat in same bullet or **Known limitations** |
| Not shipped | **Do not include** — roadmap docs only |
| Security fix | **Security** — no exploit detail |

Run mentally: *Would this bullet fail `forbidden-claims-enforcement` CI?* If yes, rewrite.

**Founder sign-off required when:** first LIVE integration claim, marketplace GA language, AI module capability changes, or pricing/enterprise claims.

### Step 4 — Publish

1. Click **Publish** on draft (`publishReleaseNote` sets `published: true`, `publishedAt: now`).
2. Verify **`https://<env>/changelog`** — entry appears within ISR window (`revalidate = 300`, ~5 min max).
3. For operator banner: prepend entry to `STATIC_RELEASES` in `lib/changelog/releases.ts` (until DB-driven banner ships).
4. For major releases: append section to [`CHANGELOG.md`](../CHANGELOG.md) with deploy id / date.
5. Record production migration + deploy in ops runbook if applicable.

### Step 5 — Distribute (optional)

| Channel | When | Owner |
|---------|------|-------|
| Beta email sequence | Published `ReleaseNote` trigger | Growth / CS — see [`BETA_EMAIL_SEQUENCES.md`](./BETA_EMAIL_SEQUENCES.md) |
| Design partner Slack | Pilot-visible changes | CS |
| LinkedIn / feature post | Major milestone only | Marketing — use Task 67 template when available |
| Support macro | Breaking UX or new routes | Support |

---

## Content template

Use this structure in **Content** (markdown-style plain text):

```text
## New
- …

## Improved
- …

## Fixed
- …

## Security
- …

## Known limitations
- …
```

### Writing rules

| Rule | Example |
|------|---------|
| Lead with operator outcome | “Filter marketplace catalog by category on mobile” not “Added CatalogFilterBar” |
| Name integration status | “DoorDash webhook scaffold (BETA — not production-certified)” |
| Separate deploy facts | “Applied marketplace_core migration on staging” vs feature bullets |
| No forbidden phrases | Avoid “untouchable”, “fully automated”, “national network” — see claims registry |
| Link to docs, not secrets | `/trust`, `/docs/...` — never env var values |

---

## Pre-publish checklist

| # | Check | Owner |
|---|-------|-------|
| 1 | Deploy to target env complete; health OK | Eng |
| 2 | All bullets verified in staging or prod | Eng |
| 3 | Claims review PASS (registry + caveats) | PM / Founder |
| 4 | **Known limitations** section present if any BETA/PLACEHOLDER touched | PM |
| 5 | Slug unique; version label set | Eng |
| 6 | No credentials, tenant names, or PII in content | Eng |
| 7 | Migrations noted if user-visible feature depends on them | Eng |
| 8 | Support briefed on top 3 customer-facing changes | CS |

---

## Post-publish verification

| Check | Pass when |
|-------|-----------|
| `/changelog` lists new entry | Title, version, date visible |
| Draft no longer shows “draft” in Developer → Releases | `published: true` |
| Dashboard banner (if updated) | New version dismisses correctly |
| Forbidden claims scan | No new violations in public routes |
| Pilot artifact | Major releases referenced in weekly pilot sync if applicable |

---

## Emergency / hotfix path

For **P0 security or outage** fixes:

1. Deploy fix first.
2. Publish minimal **Security** or **Fixed** note within **24 hours**.
3. Skip batching — single-bullet note is acceptable.
4. Founder notified before publish if exploit-adjacent.
5. Full retrospective note may follow in next scheduled release.

---

## What not to do

| Anti-pattern | Why |
|--------------|-----|
| Publish roadmap items as **New** | Violates sales-safe registry |
| Copy marketing landing copy verbatim | Overstates vs honesty UI |
| Edit published `ReleaseNote` in DB without process | No audit trail — create corrective follow-up note instead |
| Rely on static fallback long-term | Hides real shipping velocity |
| Bump `APP_VERSION` every PR | Noise for support and partners |

---

## Related docs & tasks

| Resource | Topic |
|----------|-------|
| [`CHANGELOG_RELEASE_NOTES_FINAL.md`](./CHANGELOG_RELEASE_NOTES_FINAL.md) | Format seed + MVP foundation template |
| [`migration-deployment-process.md`](./migration-deployment-process.md) | Record deploy after prod migrate |
| [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) | Pre-publish claims gate |
| [`pilot-metrics-review-process.md`](./pilot-metrics-review-process.md) | Align major notes with R1–R5 reviews |
| [`incident-response-process.md`](./incident-response-process.md) | Hotfix comms (Task 61) |
| Task 67 | `docs/feature-announcement-template.md` |
| Task 56 | This document |

---

## Next actions

1. **Engineering:** After next prod deploy, create first real `ReleaseNote` draft (replace static-only `/changelog` fallback).
2. **PM:** Add release note step to weekly pilot ops checklist.
3. **Backlog:** Wire `ChangelogBanner` to latest published `ReleaseNote` — remove manual `STATIC_RELEASES` sync.
