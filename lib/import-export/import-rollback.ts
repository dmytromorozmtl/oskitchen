/**
 * Rollback orchestration placeholder — records intent and links to {@link ImportRollback}.
 * Destructive undo requires explicit product rules; see docs/IMPORT_ROLLBACK.md.
 */
export type RollbackIntent = {
  importJobId: string;
  performedById: string;
  reason: string;
};

export function describeRollbackScope(): string {
  return "Rollback applies only to rows created in the same import job when prior snapshots were captured.";
}
