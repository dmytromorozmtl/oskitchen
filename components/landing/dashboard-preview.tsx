"use client";

import { motion } from "framer-motion";
import {
  ChefHat,
  Package,
  Truck,
  UtensilsCrossed,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const stats = [
  { label: "Active orders", value: "128", delta: "+18%", icon: UtensilsCrossed },
  { label: "Production", value: "94%", delta: "On track", icon: ChefHat },
  { label: "Packed today", value: "312", delta: "+42", icon: Package },
  { label: "Deliveries", value: "56", delta: "AM window", icon: Truck },
];

export function DashboardPreview() {
  return (
    <section className="px-4 pb-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-2xl" />
          <Card className="relative overflow-hidden rounded-2xl border-border/80 bg-card/80 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-6 border-b border-border/70 bg-muted/40 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Live snapshot
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight">
                  Production pulse
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Preorder closes in 14h</Badge>
                <Badge variant="success">Kitchen synced</Badge>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <s.icon className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{s.delta}</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid gap-4 border-t border-border/70 bg-muted/30 p-6 lg:grid-cols-3">
              <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 p-4">
                <p className="text-sm font-medium">Weekly menu</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Drag meals, lock preorder deadlines, publish prepared dates.
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/90 p-4">
                <p className="text-sm font-medium">Packing lanes</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Printable sheets grouped by customer or fulfillment type.
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/90 p-4">
                <p className="text-sm font-medium">Customer updates</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Automated confirmations and pickup reminders via email.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
