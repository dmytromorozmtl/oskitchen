export function resolveGoLivePilotReadinessTargetProject<T extends { id: string }>(
  projects: readonly T[],
  preferredProjectId?: string | null,
): T | null {
  if (preferredProjectId) {
    return projects.find((project) => project.id === preferredProjectId) ?? projects[0] ?? null;
  }
  return projects[0] ?? null;
}
