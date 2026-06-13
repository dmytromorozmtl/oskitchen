"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";

import { deactivateScimProvisionedUserAction } from "@/actions/workspace-scim";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScimProvisionedUserAdminRow } from "@/lib/enterprise/workspace-scim-admin-service";
import {
  SCIM_DEACTIVATE_USER_TEST_ID,
  SCIM_PROVISION_USER_COUNT_TEST_ID,
  SCIM_PROVISION_USER_ROW_TEST_ID,
  SCIM_PROVISION_USER_STATUS_TEST_ID,
  SCIM_PROVISION_USERS_PANEL_TEST_ID,
} from "@/lib/qa/scim-provision-ui-e2e-policy";

type Props = {
  users: ScimProvisionedUserAdminRow[];
};

export function ScimProvisionedUsersPanel({ users }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const activeCount = users.filter((user) => user.active).length;

  function deactivate(scimUserId: string) {
    startTransition(async () => {
      const result = await deactivateScimProvisionedUserAction(scimUserId);
      if (!result.ok) {
        toast.error(result.error ?? "Could not deactivate user.");
        return;
      }
      toast.success(result.data?.message ?? "User deactivated.");
      router.refresh();
    });
  }

  return (
    <Card data-testid={SCIM_PROVISION_USERS_PANEL_TEST_ID}>
      <CardHeader>
        <CardTitle className="text-base">Provisioned users</CardTitle>
        <CardDescription>
          SCIM 2.0 users synced from your IdP — deactivate to revoke workspace access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground" data-testid={SCIM_PROVISION_USER_COUNT_TEST_ID}>
          {activeCount} active · {users.length} total
        </p>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No SCIM users provisioned yet.</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 p-3 text-sm"
                data-testid={SCIM_PROVISION_USER_ROW_TEST_ID(user.id)}
              >
                <div className="min-w-0">
                  <p className="font-medium">{user.displayName ?? user.userName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.userName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={user.active ? "default" : "secondary"}
                    data-testid={SCIM_PROVISION_USER_STATUS_TEST_ID(user.id)}
                  >
                    {user.active ? "Active" : "Revoked"}
                  </Badge>
                  {user.active ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={pending}
                      data-testid={SCIM_DEACTIVATE_USER_TEST_ID(user.id)}
                      onClick={() => deactivate(user.id)}
                    >
                      <UserMinus className="mr-1 h-3.5 w-3.5" aria-hidden />
                      Deactivate
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
