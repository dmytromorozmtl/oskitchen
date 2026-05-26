"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "kitchenos-nps-dismissed";
const MIN_DAYS_SINCE_SIGNUP = 30;

type NpsSurveyPromptProps = {
  /** ISO date when workspace was created — hide until day 30 */
  workspaceCreatedAt?: string | null;
};

/**
 * Day-30 NPS prompt. Stores dismissal in localStorage.
 * Replace Typeform URL via NEXT_PUBLIC_NPS_SURVEY_URL for full survey.
 */
export function NpsSurveyPrompt({ workspaceCreatedAt }: NpsSurveyPromptProps) {
  const [open, setOpen] = useState(false);
  const surveyUrl = process.env.NEXT_PUBLIC_NPS_SURVEY_URL?.trim();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    if (workspaceCreatedAt) {
      const created = new Date(workspaceCreatedAt).getTime();
      const days = (Date.now() - created) / (1000 * 60 * 60 * 24);
      if (days < MIN_DAYS_SINCE_SIGNUP) return;
    }

    const t = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, [workspaceCreatedAt]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  function submitScore(score: number) {
    if (window.posthog?.capture) {
      window.posthog.capture("nps_score", { score });
    }
    if (surveyUrl) {
      window.open(`${surveyUrl}?score=${score}`, "_blank", "noopener,noreferrer");
    }
    dismiss();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How likely are you to recommend KitchenOS?</DialogTitle>
          <DialogDescription>
            Your feedback shapes the roadmap — especially during the pilot program.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap justify-center gap-2 py-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <Button
              key={n}
              type="button"
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 font-semibold"
              onClick={() => submitScore(n)}
            >
              {n}
            </Button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">0 = not likely · 10 = very likely</p>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
            Not now
          </Button>
          {surveyUrl ? (
            <Button asChild variant="link" size="sm">
              <Link href={surveyUrl} target="_blank" rel="noopener noreferrer">
                Full survey
              </Link>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
