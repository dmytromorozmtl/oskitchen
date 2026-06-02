import { CameraOff } from "lucide-react";

/** Shown when feeds use KDS inference / demo data — not live computer vision. */
export function KitchenCameraPreviewBanner() {
  return (
    <div
      role="status"
      data-testid="kitchen-camera-preview-banner"
      className="flex items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-50"
    >
      <CameraOff className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">Preview mode — no live camera connected</p>
        <p className="text-sm opacity-90">
          Station metrics are inferred from KDS and demo data until a camera stream URL is configured.
        </p>
      </div>
    </div>
  );
}
