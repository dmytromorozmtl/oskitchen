import {
  collectProductionReadinessIssues,
  productionStartupReadinessFailure,
  shouldFatalOnNodeStartup,
} from "@/lib/startup/production-readiness";

function main(): void {
  const forceProduction = process.argv.includes("--production");
  if (forceProduction) {
    process.env.NODE_ENV = "production";
  }

  const issues = collectProductionReadinessIssues();

  console.log("OS Kitchen startup readiness\n");
  console.log(`NODE_ENV=${process.env.NODE_ENV ?? "unset"}`);
  console.log(`fatal_on_boot=${shouldFatalOnNodeStartup() ? "yes" : "no"}\n`);

  if (issues.length === 0) {
    console.log("✓ No production startup readiness blockers detected");
    return;
  }

  for (const issue of issues) {
    console.log(`✗ [${issue.id}] ${issue.message}`);
  }

  const failure = productionStartupReadinessFailure();
  if ((forceProduction || process.env.NODE_ENV === "production") && failure) {
    process.exitCode = 1;
  }
}

main();
