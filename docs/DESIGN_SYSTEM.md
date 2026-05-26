# Design system (KitchenOS)

KitchenOS is built on **Tailwind CSS** + **shadcn/ui** primitives (`components/ui/*`). This document captures **semantic intent** so new screens stay visually aligned without ad-hoc styling.

## Typography

| Role | Tailwind pattern | Notes |
|------|-------------------|-------|
| Page title | `text-3xl font-semibold tracking-tight` | Dashboard hero (see `HomeOverview`). |
| Section label | `text-sm font-semibold uppercase tracking-wide text-muted-foreground` | Quick actions row. |
| Card title | `text-lg` or `text-xs font-medium text-muted-foreground` for KPI tiles. |
| Body | `text-sm text-muted-foreground` | Explanations under headings. |

## Spacing & layout

- Page sections: `space-y-8` vertical rhythm on dashboard pages.  
- Card grids: `gap-4` baseline; upgrade to `gap-3` only for dense tablet ops views.  
- Sticky operational surfaces: `sticky top-0 z-30` + `backdrop-blur-md` + translucent background (see `OperationalSignalBar`).

## Color semantics

| Semantic | Suggestion |
|----------|------------|
| Success / clear | `text-emerald-700` (light), `dark:text-emerald-400` |
| Warning / attention | `text-amber-800`, borders `border-amber-500/30`, surfaces `bg-amber-500/10` |
| Danger / destructive actions | Use `Button variant="destructive"` — avoid recoloring manually. |
| Neutral chrome | `border-border/80`, `bg-card/90`, `shadow-sm` for premium restraint. |

## Components

- Prefer **Card + CardHeader + CardDescription** for explainable ops blocks.  
- Use **Badge** for environment/demos (`Demo workspace`).  
- **Buttons:** primary for irreversible happy path; `secondary` + `rounded-2xl` for dashboard quick actions.

## Loading & empty states

- Route-level: `app/dashboard/loading.tsx` patterns.  
- Inside cards: short `text-muted-foreground` copy — avoid skeleton overload unless slow fetch proven.

## Motion

- Keep transitions subtle (`transition-colors`, `hover:bg-muted/40`).  
- Avoid large parallax in operational surfaces — readability under stress matters more.

## Charts

- Keep chart card titles muted; emphasize **one** KPI sentence in `CardDescription`.  
- Prefer fewer series; annotate anomalies in text (future intelligence layer).

## References

- `components/ui/*`  
- `tailwind.config.ts`  
- `docs/GLOBAL_SYSTEM_REVIEW.md` (UX hierarchy backlog)  
