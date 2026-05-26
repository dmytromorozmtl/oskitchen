# Engineering readiness — dashboard template

**Версия:** 1.0  
**Дата:** 2026-05-15

Скопируйте в Notion / Linear / Google Sheet. Обновляйте еженедельно на релизном созвоне.

| Readiness axis | Owner | Status (Red/Yellow/Green) | Priority | Doc link | PR link | Due date | Launch impact |
|----------------|-------|---------------------------|----------|----------|---------|----------|---------------|
| IDOR inventory closure | | | P0 | `IDOR_MUTATION_INVENTORY.md` | | | Data leak |
| Public API / webhooks | | | P0 | `PUBLIC_API_WEBHOOK_SECURITY_REPORT.md` | | | Integrations |
| E2E staging gate | | | P0 | `PLAYWRIGHT_RELEASE_CI_HARDENING.md` | | | Regressions |
| Legal templates | | | P0 | `EXTERNAL_TRUST_LEGAL_P0_COMPLETION_REPORT.md` | | | Trust |
| Sentry prod | | | P0 | `OBSERVABILITY_PROD_ACTIVATION_CHECKLIST.md` | | | MTTR |
| SQL queue alerts | | | P0 | `scripts/sql/webhook-jobs-alert-queries.sql` | | | Lost orders |
| Performance baseline | | | P1 | `PERFORMANCE_LOAD_BASELINE_PLAN.md` | | | UX |
| Backup / DR drill | | | P1 | `BACKUP_DISASTER_RECOVERY_PLAN.md` | | | RPO |
| Dependabot hygiene | | | P1 | `DEPENDENCY_SECURITY_UPDATE_PROCESS.md` | | | CVE |
