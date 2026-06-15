'use client';

import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { LANDING_HERO_METRICS } from '@/lib/marketing/landing-content';

export function HeroDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative"
    >
      <motion.div
        aria-hidden
        className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/25 via-primary/5 to-transparent blur-2xl"
      />
      <div
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-elevated"
      >
        <div className="flex flex-col gap-4 border-b border-border/70 bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Live overview
            </p>
            <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
              Today&apos;s service
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              Lunch service
            </Badge>
            <Badge variant="success" className="rounded-full">
              Kitchen synced
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          {LANDING_HERO_METRICS.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + index * 0.06, duration: 0.35 }}
              className="rounded-xl border border-border/70 bg-background/90 p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <metric.icon className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-xs text-muted-foreground">{metric.delta}</span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-3 border-t border-border/70 bg-muted/25 p-4 sm:grid-cols-3 sm:p-5">
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3.5">
            <p className="text-sm font-medium">Order queue</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              POS, QR, and preorder in one prioritized list.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-3.5 shadow-card">
            <p className="text-sm font-medium">Kitchen display</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Bump tickets when ready — expo stays in sync.
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-3.5 shadow-card">
            <p className="text-sm font-medium">Dispatch</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Pickup windows and route handoff when enabled.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
