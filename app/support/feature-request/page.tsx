import { submitSupportTicketFormAction } from "@/actions/external";
import { FormShell } from "@/components/marketing/public-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "Feature request" };

export default function FeatureRequestPage() {
  return (
    <FormShell title="Feature request" description="Tell us what workflow would make KitchenOS more useful. Requests are reviewed, not guaranteed.">
      <form action={submitSupportTicketFormAction} className="grid gap-4">
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="subject" placeholder="Feature request title" required />
        <input type="hidden" name="category" value="FEATURE_REQUEST" />
        <input type="hidden" name="priority" value="MEDIUM" />
        <Textarea name="message" placeholder="Describe the workflow, current workaround, and business impact." required />
        <Button type="submit">Submit request</Button>
      </form>
    </FormShell>
  );
}
