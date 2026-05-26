# UI Design System Polish (Final)

## New primitives (incremental adoption)

| Path | Role |
|------|------|
| `components/layout/page-header.tsx` | Title + description + actions row |
| `components/layout/page-section.tsx` | Section scaffold |
| `components/layout/action-bar.tsx` | Rounded action strip |
| `components/cards/kpi-card.tsx` | KPI tile |
| `components/cards/health-card.tsx` | Health / status card |
| `components/tables/data-table-shell.tsx` | Toolbar + bordered scroll region |
| `components/feedback/loading-skeleton.tsx` | Pulse skeleton + page skeleton |
| `components/feedback/error-state.tsx` | Friendly failure card |
| `components/feedback/success-toast.tsx` | Thin `sonner` wrapper |

## Rules

- One **primary** CTA per major section.  
- Destructive actions use `destructive` / red variants (existing shadcn tokens).  
- Avoid raw stack traces — use `services/errors/error-normalization-service.ts`.

## Migration strategy

Apply `PageHeader` to one high-traffic route per sprint (Orders, Today, POS) to avoid churn.
