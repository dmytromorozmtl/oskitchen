/** Publish pipeline — today `StorefrontSettings` + `StorefrontPage.published` are live; version table is future work. */
export function publishServiceNotes(): string[] {
  return [
    "Pages: toggle `published` on `StorefrontPage`.",
    "Global theme: `StorefrontSettings` fields apply immediately — introduce `StorefrontThemeVersion` before marketing draft/publish UX.",
  ];
}
