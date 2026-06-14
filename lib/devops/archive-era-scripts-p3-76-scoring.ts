import {
  ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS,
  ARCHIVE_ERA_SCRIPTS_P3_76_SCENARIO_COUNT,
} from "@/lib/devops/archive-era-scripts-p3-76-policy";

export type ArchiveEraScriptsBenchmarkInputP376 = {
  activeScriptCount: number;
  archivedScriptCount: number;
  eraInArchiveCount: number;
  eraInActiveCount: number;
  sprawlInActive: number;
  routerPrefixesPresent: boolean;
};

export type ArchiveEraScriptsBenchmarkP376Result = {
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

export function buildArchiveEraScriptsCorpusP376(
  input: ArchiveEraScriptsBenchmarkInputP376,
): ReturnType<typeof scenario>[] {
  return [
    scenario("ae-01-active-under-500", "Active scripts under 500", () => {
      if (input.activeScriptCount >= ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS) {
        return {
          passed: false,
          message: `Active ${input.activeScriptCount} >= ${ARCHIVE_ERA_SCRIPTS_P3_76_MAX_ACTIVE_SCRIPTS}`,
        };
      }
      return { passed: true };
    }),
    scenario("ae-02-era-archived", "Era scripts live in archive", () => {
      if (input.eraInArchiveCount <= 0) {
        return { passed: false, message: "No era scripts in archive" };
      }
      return { passed: true };
    }),
    scenario("ae-03-no-era-active", "No era scripts in active package.json", () => {
      if (input.eraInActiveCount > 0) {
        return { passed: false, message: `${input.eraInActiveCount} era scripts still active` };
      }
      return { passed: true };
    }),
    scenario("ae-04-no-sprawl-active", "Router sprawl removed from active surface", () => {
      if (input.sprawlInActive > 0) {
        return { passed: false, message: `${input.sprawlInActive} sprawl scripts still active` };
      }
      return { passed: true };
    }),
    scenario("ae-05-routers-present", "Router prefixes wired in package.json", () => {
      if (!input.routerPrefixesPresent) {
        return { passed: false, message: "Missing router prefix entries" };
      }
      return { passed: true };
    }),
    scenario("ae-06-archive-populated", "Archive has consolidated scripts", () => {
      if (input.archivedScriptCount < 1000) {
        return { passed: false, message: `Archive too small: ${input.archivedScriptCount}` };
      }
      return { passed: true };
    }),
  ];
}

export function runArchiveEraScriptsBenchmarkP376(
  input: ArchiveEraScriptsBenchmarkInputP376,
): ArchiveEraScriptsBenchmarkP376Result {
  const scenarios = buildArchiveEraScriptsCorpusP376(input);
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
      scenarios.length === ARCHIVE_ERA_SCRIPTS_P3_76_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}
