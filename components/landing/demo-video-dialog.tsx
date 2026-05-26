'use client';

import { Play } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const DEMO_VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL?.trim();

function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      const id =
        parsed.searchParams.get('v') ??
        (parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : null);
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
    }
    if (parsed.hostname.includes('loom.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://www.loom.com/embed/${id}`;
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return null;
  }
}

type Props = {
  onOpen?: () => void;
  triggerClassName?: string;
};

export function DemoVideoDialog({ onOpen, triggerClassName }: Props) {
  const embed = DEMO_VIDEO_URL ? toEmbedUrl(DEMO_VIDEO_URL) : null;

  if (!embed) {
    return (
      <MarketingButton href="/demo" variant="secondary" size="sm" className={triggerClassName}>
        Interactive demo
      </MarketingButton>
    );
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) onOpen?.();
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            'inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20'
          }
        >
          <Play className="h-4 w-4 fill-current" aria-hidden />
          Watch product tour
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>KitchenOS product tour</DialogTitle>
          <DialogDescription>Video overview of POS and kitchen operations in KitchenOS.</DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={embed}
            title="KitchenOS product tour"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function hasDemoVideo(): boolean {
  return Boolean(DEMO_VIDEO_URL && toEmbedUrl(DEMO_VIDEO_URL));
}
