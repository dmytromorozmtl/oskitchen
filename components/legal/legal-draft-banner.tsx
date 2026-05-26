export function LegalDraftBanner() {
  return (
    <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-950/35">
      <p className="text-sm font-medium text-amber-800 dark:text-amber-100">Draft document</p>
      <p className="mt-1 text-sm text-amber-700 dark:text-amber-200/90">
        This is a template and has not been reviewed by legal counsel. Do not rely on this document
        without professional legal review specific to your jurisdiction and use case.
      </p>
    </div>
  );
}
