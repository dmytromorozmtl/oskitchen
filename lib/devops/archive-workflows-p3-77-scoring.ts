import {
  ARCHIVE_WORKFLOWS_P3_77_MAX_ACTIVE,
  ARCHIVE_WORKFLOWS_P3_77_MIN_ARCHIVED,
  ARCHIVE_WORKFLOWS_P3_77_SCENARIO_COUNT,
} from "@/lib/devops/archive-workflows-p3-77-policy";

export type ArchiveWorkflowsBenchmarkInputP377 = {
  activeCount: number;
  archivedCount: number;
  eraInActiveCount: number;
  eraInArchivedCount: number;
  allowlistComplete: boolean;
  nonCanonicalActiveCount: number;
};

export type ArchiveWorkflowsBenchmarkP377Result = {
  scenarioCount: number;
  passedCount: number;
  passPct: number;
  passed: boolean;
  scenarioScores: Array<{ scenarioId: string; passed: boolean; message?: string }>;
};

function scenario(
  id: string,
  label: string,
  run: () => { passed: boolean; message?: string },
) {
  return { id, label, run };
}

export function buildArchiveWorkflowsCorpusP377(
  input: ArchiveWorkflowsBenchmarkInputP377,
): ReturnType<typeof scenario>[] {
  return [
    scenario("aw-01-active-under-40", "Active workflows ≤40", () => {
      if (input.activeCount > ARCHIVE_WORKFLOWS_P3_77_MAX_ACTIVE) {
        return { passed: false, message: `Active ${input.activeCount} > ${ARCHIVE_WORKFLOWS_P3_77_MAX_ACTIVE}` };
      }
      return { passed: true };
    }),
    scenario("aw-02-era-archived", "Era theater workflows archived", () => {
      if (input.eraInActiveCount > 0) {
        return { passed: false, message: `${input.eraInActiveCount} era workflows still active` };
      }
      if (input.eraInArchivedCount < 10 && input.archivedCount < ARCHIVE_WORKFLOWS_P3_77_MIN_ARCHIVED) {
        return {
          passed: false,
          message: `Era archived ${input.eraInArchivedCount}, total archived ${input.archivedCount}`,
        };
      }
      return { passed: true };
    }),
    scenario("aw-03-no-era-active", "No era25 ops workflows in active dir", () => {
      if (input.eraInActiveCount > 0) {
        return { passed: false, message: `${input.eraInActiveCount} era workflows still active` };
      }
      return { passed: true };
    }),
    scenario("aw-04-allowlist-complete", "Canonical allowlist fully present", () => {
      if (!input.allowlistComplete) return { passed: false, message: "Allowlist incomplete" };
      return { passed: true };
    }),
    scenario("aw-05-non-canonical-zero", "No non-canonical active workflows", () => {
      if (input.nonCanonicalActiveCount > 0) {
        return { passed: false, message: `${input.nonCanonicalActiveCount} non-canonical active` };
      }
      return { passed: true };
    }),
    scenario("aw-06-archive-populated", "Archive directory populated", () => {
      if (input.archivedCount < ARCHIVE_WORKFLOWS_P3_77_MIN_ARCHIVED) {
        return { passed: false, message: `Archived ${input.archivedCount} < ${ARCHIVE_WORKFLOWS_P3_77_MIN_ARCHIVED}` };
      }
      return { passed: true };
    }),
  ];
}

export function runArchiveWorkflowsBenchmarkP377(
  input: ArchiveWorkflowsBenchmarkInputP377,
): ArchiveWorkflowsBenchmarkP377Result {
  const scenarios = buildArchiveWorkflowsCorpusP377(input);
  const scenarioScores = scenarios.map((scenarioItem) => {
    const outcome = scenarioItem.run();
    return {
      scenarioId: scenarioItem.id,
      passed: outcome.passed,
      message: outcome.message,
    };
  });
  const passedCount = scenarioScores.filter((score) => score.passed).length;
  const passPct =
    scenarios.length === 0 ? 0 : Math.round((passedCount / scenarios.length) * 100);

  return {
    scenarioCount: scenarios.length,
    passedCount,
    passPct,
    passed:
      scenarios.length === ARCHIVE_WORKFLOWS_P3_77_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}
