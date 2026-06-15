"use client";

import * as React from "react";

export function SeoSocialPreview({
  title,
  description,
  imageUrl,
  siteName,
}: {
  title: string;
  description: string;
  imageUrl: string;
  siteName: string;
}) {
  const [tab, setTab] = React.useState<"google" | "facebook">("google");

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs font-medium ${tab === "google" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          onClick={() => setTab("google")}
        >
          Google
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs font-medium ${tab === "facebook" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          onClick={() => setTab("facebook")}
        >
          Facebook / OG
        </button>
      </div>
      {tab === "google" ? (
        <div className="space-y-1 text-sm">
          <p className="truncate text-[#1a0dab]">{title || siteName}</p>
          <p className="truncate text-xs text-[#006621]">yourstore.com › menu</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{description || "Add a meta description…"}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {imageUrl ? (
            <div
              className="aspect-[1.91/1] w-full bg-muted bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : (
            <div className="flex aspect-[1.91/1] items-center justify-center bg-muted text-xs text-muted-foreground">No share image</div>
          )}
          <div className="space-y-1 bg-[#f2f3f5] p-3 dark:bg-muted/50">
            <p className="text-[10px] uppercase text-muted-foreground">{siteName.toUpperCase()}</p>
            <p className="line-clamp-2 text-sm font-semibold">{title || siteName}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{description || "Add a meta description…"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Live preview bound to SEO form fields */
export function SeoSocialPreviewLive({
  defaultTitle,
  defaultDescription,
  defaultImageUrl,
  siteName,
}: {
  defaultTitle: string;
  defaultDescription: string;
  defaultImageUrl: string;
  siteName: string;
}) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [description, setDescription] = React.useState(defaultDescription);
  const [imageUrl, setImageUrl] = React.useState(defaultImageUrl);

  React.useEffect(() => {
    const form = document.getElementById("storefront-seo-form");
    if (!form) return;
    const onInput = () => {
      const t = (form.querySelector('[name="seoTitle"]') as HTMLInputElement | null)?.value ?? "";
      const d = (form.querySelector('[name="seoDescription"]') as HTMLTextAreaElement | null)?.value ?? "";
      const img = (form.querySelector('[name="seoImageUrl"]') as HTMLInputElement | null)?.value ?? "";
      setTitle(t);
      setDescription(d);
      setImageUrl(img);
    };
    form.addEventListener("input", onInput);
    return () => form.removeEventListener("input", onInput);
  }, []);

  return <SeoSocialPreview title={title} description={description} imageUrl={imageUrl} siteName={siteName} />;
}
