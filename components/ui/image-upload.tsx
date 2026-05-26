"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { uploadProductImageAction } from "@/actions/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  id?: string;
  label?: string;
  value: string;
  onChange: (url: string) => void;
};

export function ImageUploadField({
  id = "imageUpload",
  label = "Image URL or upload",
  value,
  onChange,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, startTransition] = React.useTransition();

  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-url`}>{label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          id={`${id}-url`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="flex-1"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            startTransition(async () => {
              const fd = new FormData();
              fd.set("file", file);
              const res = await uploadProductImageAction(fd);
              if ("error" in res && res.error) toast.error(getActionError(res) ?? "Something went wrong");
              else if ("publicUrl" in res && res.publicUrl) {
                onChange(res.publicUrl);
                toast.success("Image uploaded");
              }
            });
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {pending ? "Uploading…" : "Upload"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Paste a CDN URL or upload to the{" "}
        <code className="rounded bg-muted px-1">product-images</code> bucket (Supabase
        Storage).
      </p>
    </div>
  );
}
