# Dependency & security update process

**Версия:** 1.0  
**Дата:** 2026-05-15

## Dependabot

- Файл: `.github/dependabot.yml` — **weekly** npm updates.  
- **Без auto-merge**: каждый PR проходит `ci.yml` (typecheck, lint, test, build).

## Weekly human process

1. Понедельник: ревью Dependabot PRs.  
2. `npm audit` локально на `main` после крупных merges.  
3. Critical CVE: внеочередной патч в течение 72h (SLA команды).

## Lockfile

- `package-lock.json` коммитится; не смешивать с yarn/pnpm без миграции.

## Security patches

| Severity | Action |
|----------|--------|
| Critical | Patch + release same day if exploitable |
| High | Patch within sprint week |
| Medium/Low | Batch via Dependabot |

## After dependency updates

- Обязательно: `npm run typecheck && npm test && npm run build` локально или в CI.
