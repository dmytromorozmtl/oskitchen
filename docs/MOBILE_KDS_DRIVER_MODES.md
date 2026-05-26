# Mobile KDS & Driver Modes

## Routes

| Route | Purpose |
|-------|---------|
| `/kds` | Tablet-friendly entry → kitchen fullscreen / standard kitchen. |
| `/driver` | Mobile entry → driver route surfaces. |
| `/dashboard/kitchen/tablet` | Alias redirect → `/dashboard/kitchen/fullscreen`. |
| `/dashboard/packing/scanner` | Hub linking to `/dashboard/packing/verify`. |
| `/dashboard/routes/driver` | Existing driver workload UI. |

## Principles

- **Role-aware** — drivers never see billing secrets or full financial exports by default.  
- **Degraded/offline** messaging — polling fallback acceptable; silent wrong state is not.  
- **No admin chrome** on `/kds` and `/driver` entry pages — large CTAs only.

## P2

- PWA manifest + service worker strategy (explicit project).  
- Station filters persisted per device.
