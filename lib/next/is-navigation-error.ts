/** True for Next.js `redirect()` / `notFound()` control-flow errors — must rethrow from catch blocks. */
export function isNextNavigationError(error: unknown): boolean {
  if (error instanceof Error && error.message === "NEXT_REDIRECT") return true;
  if (typeof error !== "object" || error === null) return false;
  const digest = (error as { digest?: string }).digest;
  if (typeof digest !== "string") return false;
  return digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND");
}
