# Public changelog updates (P3-87)

**Policy:** `public-changelog-updates-p3-87-v1`  
**Updated:** 2026-06-16  
**Route:** `/changelog`

Gap closure: regular public changelog entries with honest **LIVE**, **BETA**, and **PREVIEW** maturity labels.

---

## Behavior

| Source | When shown |
|--------|------------|
| `ReleaseNote` DB rows (`published: true`) | Primary when database connected |
| `PUBLIC_CHANGELOG_RELEASES` static feed | Fallback when no published DB rows |

## Maturity labels

| Label | Meaning |
|-------|---------|
| **LIVE** | Shipped and verified for pilot/dev-store proof |
| **BETA** | Functional with known limits — review Integration Health |
| **PREVIEW** | Engineering or policy prep — not a production parity claim |

## Current releases (curated)

1. **2026.06.16** — Operator trust, KB SEO, partner prep
2. **2026.06.14** — Integration LIVE smoke and inventory proofs
3. **2026.06.01** — Commercial MVP foundation

Canonical content: `lib/marketing/public-changelog-p3-87-content.ts`

## Update process

1. Add a new release object to `PUBLIC_CHANGELOG_RELEASES` (newest first)
2. Tag each item LIVE / BETA / PREVIEW — never upgrade without proof
3. Mirror major entries in root `CHANGELOG.md` for engineering history
4. Optionally publish via Developer → Releases for DB-backed notes

## CI

```bash
npm run check:public-changelog-p3-87
```

## Artifact

`artifacts/public-changelog-updates-p3-87.json`
