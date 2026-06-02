# Kitchen Camera AI Framework

Cycle 17 — on-device object detection framework with queue, activity, PPE, and equipment analysis.

## Service

- `services/ai/kitchen-camera.ts` — `analyzeKitchenCameras`, `analyzeCameraFrame`, `analyzeKitchenCamerasWithFrames`
- `lib/ai/kitchen-camera-builders.ts` — pure analysis (activity level, PPE, equipment, summaries)
- `lib/ai/kitchen-camera-types.ts` — `CameraAnalysis`, `CameraFrameAnalysis`, `DetectedObject`
- `lib/ai/kitchen-camera-storage.ts` — camera registry in `settingsCenterJson.kitchenCameras`

## Data sources

| Input | Source |
|-------|--------|
| Camera registry | `ProductionStation` bootstrap or `kitchenCameras` settings |
| Queue length | KDS live orders routed to stations (same as Digital Twin) |
| On-device detections | `analyzeCameraFrame({ detections[] })` — person, food, equipment, PPE labels |
| Staff count | Person detections or Digital Twin staff assignment |
| Activity level | Derived from queue ÷ capacity ÷ staff |

## Output

`CameraFrameAnalysis` per camera:

- `detections[]` — on-device object labels + confidence + optional bbox
- `queueLength` — orders at station
- `activityLevel` — idle / normal / busy / overloaded
- `ppe` — hairnet, gloves, apron compliance + violations
- `equipmentStatus` — offline / idle / running / warning / error

`CameraAnalysis.summary`:

- avg/max queue, overloaded stations, PPE compliance %, equipment issues

## On-device integration

Post frame results to `analyzeCameraFrame(workspaceId, { cameraId, detections, queueLength? })`.
Use `analyzeKitchenCamerasWithFrames` to merge live frames with KDS fallback.

## Tests

- `tests/unit/kitchen-camera-builders.test.ts`
- `tests/integration/kitchen-camera.integration.test.ts`

## Next cycle

Cycle 18 — Kitchen Camera Dashboard UI (`app/dashboard/kitchen/cameras/page.tsx`)

## Dashboard UI

- `app/dashboard/kitchen/cameras/page.tsx` — live 4-up grid, overlays, alerts, timeline, heatmap, PPE report, export incident
- `components/dashboard/kitchen-cameras-dashboard.tsx`
- `services/ai/kitchen-camera-dashboard.ts` — `loadKitchenCameraDashboard`
- Timeline persisted in `settingsCenterJson.kitchenCameraHistory`

## Tests

- `tests/unit/kitchen-camera-dashboard-builders.test.ts`

## Next cycle

~~Cycle 18 — Kitchen Camera Dashboard~~ — done

## Camera-Twin integration

- `services/ai/camera-twin-integration.ts` — `updateTwinWithCameraData(workspaceId)`
- Camera `queueLength` → Digital Twin `station.currentLoad` (camera overrides KDS per station)
- Re-simulates via `simulateKitchen`, persists KDS predictions to `settingsCenterJson.realTimeTwin`
- Snapshot in `settingsCenterJson.cameraTwin`
- `lib/ai/camera-twin-builders.ts` — fusion helpers

## Tests

- `tests/unit/camera-twin-builders.test.ts`
- `tests/integration/camera-twin.integration.test.ts`

## Next cycle

~~Cycle 19 — Camera-Twin integration~~ — done

Cycle 20 — `services/ai/benchmark-network.ts`
