"use client";

import { getActionError, isActionSuccess } from "@/lib/action-result";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { removeAvatarAction, uploadAvatarAction } from "@/actions/settings/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AvatarUpload({
  initialAvatarUrl,
  displayName,
}: {
  initialAvatarUrl?: string | null;
  displayName?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? null);
  const [pending, setPending] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPending(true);
    const fd = new FormData();
    fd.set("avatar", file);
    const result = await uploadAvatarAction(fd);
    setPending(false);

    const uploadErr = getActionError(result);
    if (uploadErr) {
      toast.error(uploadErr);
      return;
    }

    if (isActionSuccess<{ avatarUrl: string }>(result) && result.data?.avatarUrl) {
      setAvatarUrl(result.data.avatarUrl);
    }
    toast.success("Avatar updated");
    e.target.value = "";
  }

  async function handleRemove() {
    setPending(true);
    const result = await removeAvatarAction();
    setPending(false);

    const removeErr = getActionError(result);
    if (removeErr) {
      toast.error(removeErr);
      return;
    }

    setAvatarUrl(null);
    toast.success("Avatar removed");
  }

  const initials =
    displayName
      ?.split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "KO";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile photo</CardTitle>
        <CardDescription>Upload a photo to personalize your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <AvatarPreview avatarUrl={avatarUrl} initials={initials} />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? "Uploading…" : "Upload photo"}
          </Button>
          {avatarUrl ? (
            <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={handleRemove}>
              Remove
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}

function AvatarPreview({
  avatarUrl,
  initials,
}: {
  avatarUrl: string | null;
  initials: string;
}) {
  return (
    <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Profile avatar"
          width={72}
          height={72}
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <span className="text-lg font-semibold text-muted-foreground">{initials}</span>
      )}
    </div>
  );
}
