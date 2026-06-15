"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { useRouter } from "next/navigation";

import { uploadStorefrontMediaFormAction } from "@/actions/storefront-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MediaUploadDropzone({ uploadConfigured }: { uploadConfigured: boolean }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length || !uploadConfigured) return;
    setError(null);
    setPending(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        const res = await uploadStorefrontMediaFormAction(fd);
        if (res && "error" in res && res.error) {
          setError(getActionError(res) ?? "Something went wrong");
          break;
        }
      }
      router.refresh();
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (!uploadConfigured) {
    return (
      <div className="rounded-xl border border-dashed border-muted bg-muted/30 p-6 text-center text-sm">
        <p>
          Configure Supabase Storage (<code className="rounded bg-muted px-1">STOREFRONT_SUPABASE_STORAGE_BUCKET</code> +{" "}
          <code className="rounded bg-muted px-1">NEXT_PUBLIC_SUPABASE_URL</code>) or S3 (
          <code className="rounded bg-muted px-1">STOREFRONT_S3_*</code>) on the server. Until then, paste HTTPS URLs in Theme
          or Pages.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-dashed p-6 text-center text-sm transition-colors ${
        dragOver ? "border-primary bg-primary/5" : "border-primary/40 bg-primary/5"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        void handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        multiple
        className="sr-only"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <p className="font-medium text-foreground">Drop images here or choose files</p>
      <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP, GIF, SVG — max 8MB each</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? "Uploading…" : "Choose files"}
        </Button>
      </div>
      {error ? (
        <p className="mt-3 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
