# E2E release CI — status report

**Версия:** 1.0  
**Дата:** 2026-05-15

## Current state

| Capability | Status |
|------------|--------|
| Local Playwright (`npm run test:e2e`) | **Available** — требует локальный `dev` |
| Remote smoke workflow | **Available** — требует ручной `target_url` |
| Mandatory E2E on every PR | **Not enabled** (by design until stable preview URL) |
| DB seed job in workflow | **Optional** behind `PLAYWRIGHT_RUN_E2E_DB_SEED` |

## Gaps vs mission

| Gap | Severity |
|-----|----------|
| Нет автоматического signup→order E2E в CI | High |
| Woo webhook end-to-end only manual/staging | High |
| Platform denial spec | Medium — добавить |

## Next actions

1. Добавить `e2e/platform-access-denial.spec.ts` (или расширить существующий) с чётким skip если нет кредов.  
2. Документировать минимальный набор secrets в `README` release section (ссылка на hardening doc).  
3. После появления стабильного Preview — optional job в `ci.yml` с `if: vars.PREVIEW_URL`.
