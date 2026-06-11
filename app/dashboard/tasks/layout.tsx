import { TasksSubnav } from "@/components/dashboard/tasks-subnav";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <TasksSubnav />
      {children}
    </div>
  );
}
