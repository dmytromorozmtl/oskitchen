# Database migration runbook

## Symptoms
- Deploy fails on `prisma migrate deploy`, app cannot start

## First checks
1. `DIRECT_URL` for migrations vs pooled `DATABASE_URL`.
2. Migration lock table / concurrent deploys.

## Safe actions
- Run migrations from CI or controlled bastion; never against prod without backup.

## Escalation
- Restore from snapshot if destructive migration slipped through review.
