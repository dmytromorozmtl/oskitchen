"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-4xl space-y-3 p-6">
      <p className="text-sm text-destructive">Lightspeed integration failed to load: {error.message}</p>
      <button type="button" onClick={reset} className="rounded-xl border px-4 py-2 text-sm">
        Retry
      </button>
    </div>
  );
}
