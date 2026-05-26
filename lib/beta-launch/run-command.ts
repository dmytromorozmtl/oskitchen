import { spawnSync } from "node:child_process";

export type CommandOutcome = {
  ok: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
};

/** Run `npm run <script> -- [extraArgs...]`. */
export function runNpmScript(script: string, extraArgs: string[] = [], env?: NodeJS.ProcessEnv): CommandOutcome {
  const args = ["run", script];
  if (extraArgs.length > 0) args.push("--", ...extraArgs);
  return runCommand("npm", args, env);
}

export function runCommand(cmd: string, args: string[], env?: NodeJS.ProcessEnv): CommandOutcome {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    env: { ...process.env, ...env },
    shell: process.platform === "win32",
    maxBuffer: 8_000_000,
  });
  return {
    ok: r.status === 0,
    exitCode: r.status ?? 1,
    stdout: (r.stdout ?? "").trim(),
    stderr: (r.stderr ?? "").trim(),
  };
}
