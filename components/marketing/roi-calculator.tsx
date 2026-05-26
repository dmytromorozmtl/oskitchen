"use client";

import * as React from "react";

import Link from "next/link";

import { RoiLeadCapture } from "@/components/marketing/roi-lead-capture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RoiCalculator() {
  const [weeklyOrders, setWeeklyOrders] = React.useState(250);
  const [aov, setAov] = React.useState(18);
  const [hours, setHours] = React.useState(12);
  const [cost, setCost] = React.useState(25);
  const [mistakes, setMistakes] = React.useState(8);
  const [growth, setGrowth] = React.useState(10);

  const hoursSaved = Math.round(hours * 0.35);
  const laborSaved = hoursSaved * cost * 4.33;
  const mistakeSavings = mistakes * aov * 0.4;
  const growthRevenue = weeklyOrders * (growth / 100) * aov * 4.33 * 0.08;
  const total = laborSaved + mistakeSavings + growthRevenue;
  const plan = weeklyOrders > 1000 ? "Team" : weeklyOrders > 100 ? "Pro" : "Starter";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="grid gap-3">
        <label className="text-sm font-medium">Weekly orders<Input type="number" value={weeklyOrders} onChange={(e) => setWeeklyOrders(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">Average order value<Input type="number" value={aov} onChange={(e) => setAov(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">Manual coordination hours/week<Input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">Hourly admin/kitchen cost<Input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">Monthly mistakes/refunds<Input type="number" value={mistakes} onChange={(e) => setMistakes(Number(e.target.value))} /></label>
        <label className="text-sm font-medium">Expected growth %<Input type="number" value={growth} onChange={(e) => setGrowth(Number(e.target.value))} /></label>
      </div>
      <div className="rounded-2xl border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">Conservative estimate, not a guarantee.</p>
        <h2 className="mt-2 text-3xl font-semibold">${Math.round(total).toLocaleString()}/mo</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p>Estimated hours saved: {hoursSaved}/week</p>
          <p>Labor value: ${Math.round(laborSaved).toLocaleString()}/mo</p>
          <p>Mistake reduction value: ${Math.round(mistakeSavings).toLocaleString()}/mo</p>
          <p>Recommended plan: {plan}</p>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <RoiLeadCapture
            estimatedSavingsMonthly={total}
            weeklyOrders={weeklyOrders}
            recommendedPlan={plan}
          />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/book-demo">Book demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
