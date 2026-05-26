# Mobile ops experience

## Existing entry points

- Kitchen fullscreen: `/dashboard/kitchen/fullscreen`
- Driver: `/dashboard/routes/driver`
- Packing training / practice modules under `/dashboard/training/*`

## Target modes

1. **Kitchen tablet** — large tap targets, station filter, production done shortcuts.  
2. **Packing scanner** — QR placeholder + mismatch warnings (pair with packing verify APIs).  
3. **Driver mode** — stops list, maps link, proof-of-delivery placeholder.  
4. **Manager mobile** — Today + blockers + escalations.

## Implementation strategy

Responsive layouts + PWA considerations; **no second app** required for MVP.

## Priority

**P2** — after P1 lifecycle + hub stability.
