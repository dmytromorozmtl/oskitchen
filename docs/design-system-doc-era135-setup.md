# Design System doc smoke setup (Era 135)

Era 135 certifies Design System documentation wiring: canonical doc, policy registry, and section validation.

## Wiring surfaces

| Path | Role |
|------|------|
| `docs/design-system.md` | Canonical design reference (DES-39) |
| `lib/design/design-system-doc-policy.ts` | Section anchors, policy module registry |
| `services/design/design-system-doc-service.ts` | Section validation + health score |
| `tests/unit/design-system-doc.test.ts` | DES-39 unit coverage |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:design-system-doc-era135` | Full era135 cert + wiring audit |
| `npm run test:ci:design-system-doc-era135` | Era135 + DES-39 doc unit tests |
| `npm run test:ci:design-system-doc-era135:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **docs/design-system.md** — verify policy id and all sections present.
2. Review **Token registry**, **Layout primitives**, **Role surfaces**.
3. Check **Mobile-first** and **Dark mode** policy cross-references.
4. Confirm **Audit policy index** lists DES-24 through DES-39 modules.
5. Run `npm run smoke:design-system-doc-era135` — artifact **PASSED**.

## Required sections

Foundation · Token registry · Layout primitives · State patterns · Role surfaces · Mobile-first operator UX · Dark mode · Audit policy index · Component primitives · References

## Artifact

Summary written to `artifacts/design-system-doc-smoke-summary.json` (gitignored).
