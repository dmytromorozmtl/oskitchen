# Partner QA checklist

Run before release:

## Access

- [ ] User **without** partner access receives redirect away from `/dashboard/partner`.  
- [ ] Partner **member** (accepted `userId`) sees only accounts they belong to.  
- [ ] Partner **owner** sees owned accounts.  
- [ ] `workspace.moroz@gmail.com` (or configured superadmin) sees **all** accounts.  
- [ ] Platform `PARTNER_ADMIN` / `PLATFORM_ADMIN` behavior matches policy (all accounts today — document if tightened).

## Data integrity

- [ ] `createPartnerOrganization` rejects users without provision rights.  
- [ ] Slug collisions handled (suffix loop).  
- [ ] Command center with **zero** accessible accounts: no Prisma `in: []` errors.

## Migrations

- [ ] Fresh deploy: `prisma migrate deploy` applies partner migration; dashboard shows `migrationReady` true.  
- [ ] Pre-migration DB: degraded banner appears; page still renders.

## UI

- [ ] Empty org state copy matches product copy deck.  
- [ ] Empty client state copy matches product copy deck.  
- [ ] Client drawer shows integration summary, manager, tags, notes.  
- [ ] Dark mode: cards, charts, and sheet readable.

## Automation

- [ ] `npm run typecheck`  
- [ ] `npm run build`

## Security follow-up (manual)

- [ ] Public `/partner/clients` and `/partner/clients/[id]` require login and respect accessible partner accounts.
