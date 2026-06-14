"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { saveScimAttributeMappingAction } from "@/actions/workspace-scim-self-serve";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScimAttributeMapping } from "@/lib/enterprise/scim-enterprise-self-serve-p2-72-settings";

type Props = {
  attributeMapping: ScimAttributeMapping;
};

const USERNAME_SOURCES = [
  { value: "userName", label: "SCIM userName" },
  { value: "emails.primary", label: "Primary email" },
] as const;

const EMAIL_SOURCES = USERNAME_SOURCES;

const DISPLAY_SOURCES = [
  { value: "name.formatted", label: "name.formatted" },
  { value: "userName", label: "userName (email)" },
] as const;

const EXTERNAL_ID_SOURCES = [
  { value: "externalId", label: "externalId" },
  { value: "id", label: "SCIM resource id" },
] as const;

const ROLE_SOURCES = [
  { value: "extension.role", label: "KitchenOS role extension" },
  { value: "groups.displayName", label: "IdP group displayName" },
] as const;

export function ScimAttributeMappingPanel({ attributeMapping }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mapping, setMapping] = useState(attributeMapping);

  function save() {
    startTransition(async () => {
      const result = await saveScimAttributeMappingAction(mapping);
      if (!result.ok) {
        toast.error(result.error ?? "Could not save attribute mapping.");
        return;
      }
      toast.success(result.data?.message ?? "Attribute mapping saved.");
      router.refresh();
    });
  }

  return (
    <Card data-testid="scim-attribute-mapping-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Attribute mapping
        </CardTitle>
        <CardDescription>
          Configure how IdP SCIM attributes map to KitchenOS user fields during provisioning.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Login / userName"
          value={mapping.userNameSource}
          options={USERNAME_SOURCES}
          onChange={(value) =>
            setMapping((current) => ({
              ...current,
              userNameSource: value as ScimAttributeMapping["userNameSource"],
            }))
          }
        />
        <Field
          label="Email"
          value={mapping.emailSource}
          options={EMAIL_SOURCES}
          onChange={(value) =>
            setMapping((current) => ({
              ...current,
              emailSource: value as ScimAttributeMapping["emailSource"],
            }))
          }
        />
        <Field
          label="Display name"
          value={mapping.displayNameSource}
          options={DISPLAY_SOURCES}
          onChange={(value) =>
            setMapping((current) => ({
              ...current,
              displayNameSource: value as ScimAttributeMapping["displayNameSource"],
            }))
          }
        />
        <Field
          label="External id"
          value={mapping.externalIdSource}
          options={EXTERNAL_ID_SOURCES}
          onChange={(value) =>
            setMapping((current) => ({
              ...current,
              externalIdSource: value as ScimAttributeMapping["externalIdSource"],
            }))
          }
        />
        <Field
          label="Role resolution"
          value={mapping.roleSource}
          options={ROLE_SOURCES}
          onChange={(value) =>
            setMapping((current) => ({
              ...current,
              roleSource: value as ScimAttributeMapping["roleSource"],
            }))
          }
        />
        <div className="sm:col-span-2">
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            disabled={pending}
            data-testid="scim-save-attribute-mapping"
            onClick={save}
          >
            Save attribute mapping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
