# Repositories (target layer)

**Goal:** isolate Prisma queries per aggregate (`OrderRepository`, `CustomerRepository`, …) so server actions stay orchestration-only.

**Current state:** most data access lives in `actions/*` and page components calling `prisma` directly.

**Migration tip:** move one vertical at a time (e.g. orders) behind a repository, keep signatures stable for actions.
