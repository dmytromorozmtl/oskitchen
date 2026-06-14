"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";

import { saveScimGroupMappingsAction } from "@/actions/workspace-scim-self-serve";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScimGroupMapping } from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-settings";
import { SCIM_ASSIGNABLE_ROLES } from "@/lib/scim/scim-constants";

type Props = {
  groupMappings: ScimGroupMapping[];
};

export function ScimGroupProvisioningPanel({ groupMappings }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(groupMappings);

  function updateRow(index: number, patch: Partial<ScimGroupMapping>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: `grp-${Date.now()}`,
        idpGroupName: "",
        workspaceRole: "STAFF",
      },
    ]);
  }

  function save() {
    startTransition(async () => {
      const payload = rows.filter((row) => row.idpGroupName.trim());
      const result = await saveScimGroupMappingsAction(payload);
      if (!result.ok) {
        toast.error(result.error ?? "Could not save group mappings.");
        return;
      }
      toast.success(result.data?.message ?? "Group mappings saved.");
      router.refresh();
    });
  }

  return (
    <Card data-testid="scim-group-provisioning-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" aria-hidden />
          Group provisioning
        </CardTitle>
        <CardDescription>
          Map IdP group names (Okta, Entra) to KitchenOS workspace roles — self-serve, no support ticket.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="grid gap-2 rounded-lg border border-border/80 p-3 sm:grid-cols-[1fr_140px]">
            <Input
              value={row.idpGroupName}
              placeholder="IdP group name (e.g. KitchenOS Admins)"
              onChange={(event) => updateRow(index, { idpGroupName: event.target.value })}
            />
            <Select
              value={row.workspaceRole}
              onValueChange={(value) =>
                updateRow(index, {
                  workspaceRole: value as ScimGroupMapping["workspaceRole"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {SCIM_ASSIGNABLE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={addRow}>
            Add group mapping
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            disabled={pending}
            data-testid="scim-save-group-mappings"
            onClick={save}
          >
            Save group mappings
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {rows.length} mapping{rows.length === 1 ? "" : "s"} · first match wins when IdP sends multiple groups
        </p>
        <div className="flex flex-wrap gap-2">
          {SCIM_ASSIGNABLE_ROLES.map((role) => (
            <Badge key={role} variant="secondary" className="rounded-full">
              {role}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
