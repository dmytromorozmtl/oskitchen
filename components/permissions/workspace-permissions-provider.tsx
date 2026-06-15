"use client";

import { createContext, useContext, useMemo } from "react";

import { hasPermission } from "@/lib/permissions/guards";
import type { PermissionKey } from "@/lib/permissions/permissions";

const WorkspacePermissionsContext = createContext<ReadonlySet<PermissionKey> | null>(null);

export function WorkspacePermissionsProvider({
  grantedKeys,
  children,
}: {
  grantedKeys: readonly PermissionKey[];
  children: React.ReactNode;
}) {
  const granted = useMemo(() => new Set(grantedKeys), [grantedKeys]);
  return (
    <WorkspacePermissionsContext.Provider value={granted}>{children}</WorkspacePermissionsContext.Provider>
  );
}

export function useWorkspacePermissions(): ReadonlySet<PermissionKey> | null {
  return useContext(WorkspacePermissionsContext);
}

export function useHasWorkspacePermission(key: PermissionKey): boolean {
  const granted = useWorkspacePermissions();
  if (!granted) return false;
  return hasPermission(granted, key);
}
