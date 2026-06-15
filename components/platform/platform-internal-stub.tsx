type Props = {
  title: string;
  description: string;
};

export function PlatformInternalStub({ title, description }: Props) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{description}</p>
      <p className="mt-4 text-xs text-zinc-600">
        Internal operators only — scoped by platform RBAC. Customer workspaces use{" "}
        <span className="text-zinc-500">/dashboard</span>.
      </p>
    </div>
  );
}
