"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

import { submitAppFeedback } from "@/actions/feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState("GENERAL");
  const [pending, setPending] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="fixed bottom-6 right-4 z-40 gap-2 rounded-full shadow-lg lg:bottom-8 lg:right-8"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Routes and types help founders triage — nothing posts publicly.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          action={(fd) =>
            void (async () => {
              setPending(true);
              fd.set("type", type);
              fd.set("route", pathname || "/");
              const res = await submitAppFeedback(fd);
              setPending(false);
              const _err = getActionError(res); if (_err) toast.error(_err);
              else {
                toast.success("Thanks — feedback saved.");
                setOpen(false);
              }
            })()
          }
        >
          <div className="pointer-events-none absolute left-[-9999px] top-0 opacity-0">
            <Label htmlFor="feedback_hp">Leave blank</Label>
            <Input id="feedback_hp" name="feedback_hp" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUG">Bug</SelectItem>
                <SelectItem value="FEATURE_REQUEST">Feature request</SelectItem>
                <SelectItem value="CONFUSION">Confusion</SelectItem>
                <SelectItem value="PRICING">Pricing</SelectItem>
                <SelectItem value="INTEGRATION_REQUEST">Integration request</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ftitle">Title</Label>
            <Input id="ftitle" name="title" required placeholder="Short summary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fmsg">Details</Label>
            <Textarea id="fmsg" name="message" required rows={5} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="farea">Feature area (optional)</Label>
            <Input id="farea" name="featureArea" placeholder="Order hub, packing…" />
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={pending}>
            {pending ? "Sending…" : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
