/** Preview orchestration (signed preview cookie, draft pages) — expand without touching checkout. */
export function previewServiceNotes(): string[] {
  return [
    "Public preview uses signed preview cookie + owner session (see preview-token).",
    "Theme draft/publish split not yet enforced server-side — roadmap item.",
  ];
}
