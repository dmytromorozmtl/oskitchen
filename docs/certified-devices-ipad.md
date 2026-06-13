# Certified devices — iPad models

**Policy:** `certified-devices-ipad-p2-39-v1`  
**Department:** Hardware  
**Registry:** [`artifacts/certified-devices-ipad-p2-39-registry.json`](../artifacts/certified-devices-ipad-p2-39-registry.json)

---

## Honest baseline

OS Kitchen is **browser-first** on iPad — Safari PWA at `/dashboard/pos/tablet`, `/dashboard/kitchen`, and `/dashboard/pos/handheld`. This is **not a native iOS App Store app**. Offline card EMV is **not certified** — verify network for Stripe Terminal.

> Browser-first POS — Safari PWA at listed routes. Not a native iOS App Store app. Offline card EMV is not certified; verify network for Stripe Terminal capture.

Cross-refs: [`certified-hardware-guide.md`](./certified-hardware-guide.md) · [`hardware-compatibility-roadmap-toast.md`](./hardware-compatibility-roadmap-toast.md) · [`hardware-compatibility.md`](./hardware-compatibility.md)

**Minimum iOS:** 16+ (iPadOS 16) for all listed models.

---

## Certification tiers

| Tier | Meaning |
|------|---------|
| **certified** | Recommended for new pilot deployments — tested POS/KDS/handheld workflows |
| **baseline** | Supported — verify iOS version and mount before rush service |
| **legacy** | Minimum supported — packing line or spare only; not for new counter POS |

---

## iPad model list (10 models)

| ID | Model | Screen | Tier | Primary use | Route |
|----|-------|--------|------|-------------|-------|
| `ipad-pro-13-m4` | iPad Pro 13" (M4, 2024) | 13" | certified | KDS expo | `/dashboard/kitchen` |
| `ipad-pro-11-m4` | iPad Pro 11" (M4, 2024) | 11" | certified | Counter POS | `/dashboard/pos/tablet` |
| `ipad-air-13-m2` | iPad Air 13" (M2, 2024) | 13" | certified | KDS expo | `/dashboard/kitchen` |
| `ipad-air-11-m2` | iPad Air 11" (M2, 2024) | 11" | certified | Counter POS | `/dashboard/pos/tablet` |
| `ipad-11-a16` | iPad (A16, 11th generation, 2025) | 11" | certified | Counter POS | `/dashboard/pos/tablet` |
| `ipad-10-2022` | iPad (10th generation, 2022) | 10.9" | certified | Counter POS | `/dashboard/pos/tablet` |
| `ipad-mini-7-a17` | iPad mini (A17 Pro, 7th generation, 2024) | 8.3" | certified | Handheld waiter | `/dashboard/pos/handheld` |
| `ipad-mini-6` | iPad mini (6th generation, 2021) | 8.3" | baseline | Handheld waiter | `/dashboard/pos/handheld` |
| `ipad-pro-129-m2` | iPad Pro 12.9" (6th generation, M2, 2022) | 12.9" | baseline | KDS expo | `/dashboard/kitchen` |
| `ipad-9-2021` | iPad (9th generation, 2021) | 10.2" | legacy | Packing line | `/dashboard/packing` |

---

## Deployment by use case

### Counter POS (certified)

- **Recommended:** iPad Pro 11" (M4), iPad Air 11" (M2), iPad (10th gen), iPad (A16 11th gen)
- Mount: Heckler Windfall, Bouncepad floor stand — see [`hardware-compatibility-roadmap-toast.md`](./hardware-compatibility-roadmap-toast.md)
- Workflow: Safari → `/dashboard/pos/tablet` → Add to Home Screen (PWA)

### KDS expo (certified)

- **Recommended:** iPad Pro 13" (M4), iPad Air 13" (M2)
- Full-screen kitchen display — bump, recall, station routing
- **verify** connection bar before rush service (web KDS refresh)

### Handheld waiter (certified / baseline)

- **Recommended:** iPad mini (A17 Pro, 7th gen)
- Pair Socket Mobile S700 Bluetooth scanner
- Route: `/dashboard/pos/handheld`

### Legacy / spare only

- iPad (9th generation, 2021) — packing line display at `/dashboard/packing` only

---

## Field checklist (new iPad station)

1. Update to **iPadOS 16+** (17+ recommended for M4 / A17 models).
2. Open Safari → sign in → navigate to target route (tablet POS, KDS, or handheld).
3. **Add to Home Screen** for kiosk-style launch.
4. Run compat center printer test if receipt printer paired.
5. Complete one test order end-to-end before service.

---

## Audit commands

```bash
npm run audit:certified-devices-ipad-p2-39
npm run check:certified-devices-ipad-p2-39
npm run audit:certified-hardware-guide
```
