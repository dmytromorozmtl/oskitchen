import { submitAdvisoryBoardApplicationFormAction } from "@/actions/scale";
import { FormShell } from "@/components/marketing/public-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE,
  ADVISORY_BOARD_PAGE_P3_86_POLICY_ID,
  ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_MEMBER_COUNT,
} from "@/lib/marketing/advisory-board-page-p3-86-policy";
import { ADVISORY_BOARD_PAGE_P3_86_RECRUITING_COPY } from "@/lib/marketing/advisory-board-page-p3-86-content";

export const metadata = {
  title: "Customer Advisory Board — OS Kitchen",
  description:
    "Apply to join the OS Kitchen operator feedback group. Recruiting phase — no published board members yet.",
};

export default function AdvisoryBoardPage() {
  const copy = ADVISORY_BOARD_PAGE_P3_86_RECRUITING_COPY;

  return (
    <FormShell title={copy.title} description={copy.description}>
      <div
        data-testid="advisory-board-honesty"
        data-policy={ADVISORY_BOARD_PAGE_P3_86_POLICY_ID}
        data-page-mode={ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE}
        className="mb-6 space-y-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
      >
        <p className="font-medium text-foreground">{copy.eyebrow}</p>
        <p>{copy.honestyNote}</p>
        <p>
          Published board members: <strong>{ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_MEMBER_COUNT}</strong>.
          Names and logos require explicit permission — this is a feedback program, not a paid
          customer claim.
        </p>
        <p>
          Target group size: {copy.targetSize}. Ideal profiles: {copy.idealProfiles.join("; ")}.
        </p>
      </div>

      <form
        action={submitAdvisoryBoardApplicationFormAction}
        data-testid="advisory-board-apply"
        className="grid gap-4"
      >
        <input name="company_hp" className="hidden" tabIndex={-1} autoComplete="off" />
        <Input name="fullName" placeholder="Full name" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="businessName" placeholder="Business name" required />
        <Input name="businessType" placeholder="Business type" />
        <Input name="website" placeholder="Website" />
        <Input name="weeklyOrderVolume" placeholder="Weekly order volume" />
        <Textarea name="whyInterested" placeholder="Why do you want to join?" />
        <Button type="submit">Apply to advisory board</Button>
      </form>
    </FormShell>
  );
}
