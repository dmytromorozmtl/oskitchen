# Kitchen camera — honest positioning

**Policy:** `kitchen-camera-honest-positioning-v1`  
**Status:** sales + GTM safe wording for Kitchen Camera AI (moat #6)  
**Updated:** 2026-06-02  
**Maturity:** BETA / preview — not LIVE computer vision until stream + model path proven  
**UI:** `/dashboard/kitchen/cameras` · [`KitchenCameraPreviewBanner`](../components/kitchen/kitchen-camera-preview-banner.tsx)

**Headline (safe):** **Camera-ready platform with configurable detection modules.**

Do not sell Kitchen Camera as live computer vision unless a workspace has a configured stream URL **and** detections are sourced from that stream with evidence.

---

## What OS Kitchen is today

| Capability | Status | Evidence |
|------------|--------|----------|
| Camera registry per station | Shipped | `getKitchenCameras()` — `services/ai/kitchen-camera.ts` |
| Station load + KDS-informed metrics | Shipped | `computeStationLoadsFromKdsOrders` |
| Configurable detection module framework | Shipped | `analyzeCameraFrameInput`, `buildCameraFrameAnalysis` |
| Digital Twin integration | Shipped | `createDigitalTwin` bootstrap when no stations |
| Preview / synthetic detections | **Default honest path** | `buildSyntheticDetections` — `lib/ai/kitchen-camera-builders` |
| Live frame ingest | **Optional** | Requires `streamUrl` on camera config |
| Preview honesty banner | Shipped | Amber banner when synthetic — `KITCHEN_CAMERA_SYNTHETIC` |

**Camera-ready** means the platform has UI, storage, station mapping, alert hooks, and module slots — not that every tenant runs live CV on day one.

---

## How synthetic vs live is decided

```typescript
// lib/ai/kitchen-camera-synthetic-mode.ts
resolveKitchenCameraSyntheticMode({
  dataSource,       // e.g. "live_frame" vs inferred/demo
  hasLiveStream,    // any camera with non-empty streamUrl
});
```

| Condition | Banner | Sales wording |
|-----------|--------|---------------|
| No `streamUrl` on cameras | **Shown** — "Preview mode — no live camera connected" | Preview / KDS-informed metrics |
| `KITCHEN_CAMERA_SYNTHETIC=1` (default) + no live stream | **Shown** | Same |
| Live stream URL configured + live frame path | Banner hidden when live path active | "Live stream connected — detection modules configurable" (qualified) |
| `KITCHEN_CAMERA_SYNTHETIC=0` | Banner suppressed by flag | Use only when ops confirms live CV path |

Env flag: `KITCHEN_CAMERA_SYNTHETIC` — defaults **honest preview on** unless explicitly `0` / `false`.

---

## Safe claims (sales + marketing)

Use qualified language tied to what the buyer's workspace actually has configured.

| Safe claim | Notes |
|------------|-------|
| "Camera-ready platform with configurable detection modules" | Primary headline |
| "Station view combines KDS order load with camera module framework" | True without live CV |
| "Preview mode shows inferred metrics until you connect a camera stream URL" | Matches UI banner |
| "Detection modules are configurable per station — rollout is workspace-scoped" | BETA maturity |
| "Integrates with Digital Twin station model" | Engineering shipped |
| "Amber preview banner when no live camera is connected" | Product honesty feature |

**Demo script:** Leave the preview banner visible. Say: *"We are camera-ready — this workspace is in preview until your RTSP or partner stream URL is configured."*

---

## Forbidden claims

| Forbidden | Why | Use instead |
|-----------|-----|-------------|
| "Live AI vision monitoring all stations" | Default path uses synthetic detections | Preview mode + configurable modules |
| "Real-time computer vision food safety" | No production CV SLO | KDS-informed + optional modules |
| "Automatic health department compliance" | Not certified | Operational alerts — not regulatory |
| "Works with any CCTV out of the box" | Requires stream URL + integration work | Camera-ready — connect stream in settings |
| "Replaces dedicated kitchen camera vendors" | BETA, module framework | Complement existing cameras when configured |
| Hiding preview banner in sales demo | Violates honesty policy | Keep banner visible |

Cross-check: [`marketing/forbidden-claims-training.md`](../marketing/forbidden-claims-training.md) · `npm run verify-claims`

---

## Buyer FAQ (short answers)

**Do I need hardware cameras to use Kitchen Camera?**  
No for preview. Station metrics and the module framework run from KDS + configured stations. Connect a stream URL when you want live frame analysis.

**Is this live video analytics?**  
Only when a stream URL is configured and the live frame path is active. Otherwise the UI shows preview mode with an amber banner.

**What detection modules exist?**  
Framework supports frame analysis builders (activity, equipment status, PPE placeholders) — maturity is **BETA**; modules are configurable, not all LIVE for every vertical.

**Can we claim food safety AI?**  
No blanket compliance claims. Describe operational visibility and configurable modules only.

---

## Engineering references

| Area | Path |
|------|------|
| Service | `services/ai/kitchen-camera.ts` |
| Synthetic builders | `lib/ai/kitchen-camera-builders.ts` |
| Synthetic mode flag | `lib/ai/kitchen-camera-synthetic-mode.ts` |
| Dashboard | `components/dashboard/kitchen-cameras-dashboard.tsx` |
| Preview banner | `components/kitchen/kitchen-camera-preview-banner.tsx` |
| Cameras page | `app/dashboard/kitchen/cameras/page.tsx` |
| Banner presence test | `tests/unit/kitchen-camera-synthetic-banner-presence.test.ts` |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Pilot scope — kitchen camera BETA |
| [`live-integration-definition-of-done.md`](./live-integration-definition-of-done.md) | When a module can be LIVE |
| [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) | All 7 AI modules (Task 19) |
| [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | Maturity source of truth |
