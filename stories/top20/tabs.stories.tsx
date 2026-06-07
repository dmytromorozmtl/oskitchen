import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { top20StoryMeta } from "./_story-meta";

const meta = top20StoryMeta("Tabs", Tabs);
export default meta;

export const OrderHub = {
  render: () => (
    <Tabs defaultValue="active" className="w-[360px]">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="text-sm text-muted-foreground">
        12 tickets in prep
      </TabsContent>
      <TabsContent value="scheduled" className="text-sm text-muted-foreground">
        3 catering holds
      </TabsContent>
    </Tabs>
  ),
};
