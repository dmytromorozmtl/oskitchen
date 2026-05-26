# Commercial MVP — critical path report

## Summary

The **critical path** (order intake → mapping → hub triage → detail → lifecycle → Today → platform support) now shares:

1. **One blocker vocabulary** (`OrderBlockerCode`) with fix routes.
2. **One lifecycle read model** (`OrderLifecycleStage`) derived from Prisma + relations.
3. **One hub surface** with triage tabs + deep links.
4. **One detail layout** with tabs + pipeline card.
5. **One platform read stack** for support + audit tails.

## MVP readiness (estimate)

| Dimension | Readiness | Notes |
|-----------|-----------|-------|
| Operational coherence | **78%** | Tabs + blockers unify story; intent mutations still enum-limited. |
| Data honesty | **85%** | No fake integrations; KPI approximations documented. |
| Security | **82%** | Platform services restored; continue hardening RBAC tests (P2). |
| UX polish | **70%** | Major surfaces improved; peripheral settings pages untouched. |

## Remaining honest limitations

- FoodOps **stage graph** is not fully persisted — `statusDetail` hooks exist but are not exhaustively written everywhere.
- Automated **intent** actions (`HOLD`, `MARK_PACKED`) need dedicated server actions beyond `updateOrderStatus`.
- **Route optimization** and **packing verification** flows remain domain-specific pages rather than lifecycle-owned subgraphs.

## Recommended next roadmap (30 days)

1. Persist selected lifecycle milestones into `statusDetail` when operators confirm checkpoints.
2. Wire **intent buttons** on order detail to guarded server actions + audit.
3. Add **Vitest** fixtures for blocker + triage filters.
4. Platform inbox: SLA + assignment heatmap.
