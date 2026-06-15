'use client';

import { HeroDashboard } from '@/components/landing/hero-dashboard';
import { DemoVideoDialog, hasDemoVideo } from '@/components/landing/demo-video-dialog';

type Props = {
  onVideoOpen?: () => void;
};

export function HeroDashboardWithVideo({ onVideoOpen }: Props) {
  const showVideo = hasDemoVideo();

  return (
    <div className="relative">
      <HeroDashboard />
      {showVideo ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-t from-slate-900/20 via-transparent to-transparent">
          <DemoVideoDialog onOpen={onVideoOpen} />
        </div>
      ) : (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <DemoVideoDialog onOpen={onVideoOpen} />
        </div>
      )}
    </div>
  );
}
