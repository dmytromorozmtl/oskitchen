#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const STATE_PATH = path.resolve(".deploy-state/predeploy-ready.json");
const BUILD_ID_PATH = path.resolve(".next/BUILD_ID");
const REQUIRED_PATHS = [
  BUILD_ID_PATH,
  path.resolve(".next/routes-manifest.json"),
  path.resolve(".next/server/app/dashboard/food-safety/page.js"),
];

function readBuildId() {
  return fs.readFileSync(BUILD_ID_PATH, "utf8").trim();
}

function ensureRequiredFiles() {
  for (const requiredPath of REQUIRED_PATHS) {
    if (!fs.existsSync(requiredPath)) {
      throw new Error(`missing_required_file=${path.relative(process.cwd(), requiredPath)}`);
    }
  }
}

function writeState(source) {
  ensureRequiredFiles();
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  const buildId = readBuildId();
  const payload = {
    source,
    buildId,
    createdAtEpochMs: Date.now(),
    nodeVersion: process.version,
  };
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `build_state=recorded path=${path.relative(process.cwd(), STATE_PATH)} buildId=${buildId} source=${source}`,
  );
}

function checkState(maxAgeMinutes) {
  ensureRequiredFiles();
  if (!fs.existsSync(STATE_PATH)) {
    throw new Error(`missing_state=${path.relative(process.cwd(), STATE_PATH)}`);
  }

  const raw = fs.readFileSync(STATE_PATH, "utf8");
  const state = JSON.parse(raw);
  const buildId = readBuildId();
  const createdAtEpochMs =
    typeof state.createdAtEpochMs === "number" ? state.createdAtEpochMs : 0;
  const ageMinutes = (Date.now() - createdAtEpochMs) / 60000;

  if (!state.buildId || state.buildId !== buildId) {
    throw new Error(`build_id_mismatch state=${state.buildId ?? "none"} current=${buildId}`);
  }
  if (!Number.isFinite(ageMinutes) || ageMinutes > maxAgeMinutes) {
    throw new Error(`state_too_old ageMinutes=${ageMinutes.toFixed(1)} maxAgeMinutes=${maxAgeMinutes}`);
  }

  console.log(
    `build_state=ready path=${path.relative(process.cwd(), STATE_PATH)} buildId=${buildId} ageMinutes=${ageMinutes.toFixed(1)} source=${state.source ?? "unknown"}`,
  );
}

function main() {
  const command = process.argv[2];
  if (command !== "write" && command !== "check") {
    console.error("Usage: node scripts/predeploy-build-state.mjs <write|check> [source|maxAgeMinutes]");
    process.exit(1);
  }

  try {
    if (command === "write") {
      writeState(process.argv[3] ?? "unknown");
      return;
    }

    const maxAgeMinutes = Number(
      process.argv[3] ?? process.env.KOS_PREDEPLOY_MAX_AGE_MINUTES ?? "180",
    );
    checkState(Number.isFinite(maxAgeMinutes) ? maxAgeMinutes : 180);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
