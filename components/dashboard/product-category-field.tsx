"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createCustomCategoryAction } from "@/actions/product-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductCategoryOption } from "@/services/products/category-service";

export function ProductCategoryField({
  options: initialOptions,
  value,
  onChange,
}: {
  options: ProductCategoryOption[];
  value: string;
  onChange: (code: string) => void;
}) {
  const [options, setOptions] = React.useState(initialOptions);
  const [showAdd, setShowAdd] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  async function handleAddCategory() {
    const name = newName.trim();
    if (!name) return;
    setPending(true);
    const fd = new FormData();
    fd.set("name", name);
    const res = await createCustomCategoryAction(fd);
    setPending(false);
    const _err = getActionError(res); if (_err) { toast.error(_err);
      return;
    }
    if (res?.ok && res.code && res.label) {
      setOptions((prev) => {
        if (prev.some((o) => o.code === res.code)) return prev;
        return [...prev, { code: res.code, label: res.label, custom: true }];
      });
      onChange(res.code);
      setNewName("");
      setShowAdd(false);
      toast.success("Category added");
    }
  }

  return (
    <div className="space-y-2">
      <Label>Category</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.code} value={o.code}>
              {o.label}
              {o.custom ? " (custom)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={() => setShowAdd((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        <Plus className="h-3 w-3" />
        Add category
      </button>
      {showAdd ? (
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Cocktails"
            className="h-9"
            disabled={pending}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAddCategory();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            className="rounded-full shrink-0"
            disabled={pending || !newName.trim()}
            onClick={() => void handleAddCategory()}
          >
            {pending ? "Adding…" : "Add"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
