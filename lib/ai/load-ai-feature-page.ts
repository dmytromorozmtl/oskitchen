export type AiFeatureLoadResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: unknown };

/** Wrap server-side AI page loaders with consistent failure capture. */
export async function loadAiFeaturePage<T>(
  loader: () => Promise<T>,
): Promise<AiFeatureLoadResult<T>> {
  try {
    return { ok: true, data: await loader() };
  } catch (error) {
    console.error("[ai-feature] page load failed", error);
    return { ok: false, error };
  }
}
