export function PageLoadingSkeleton() {
  return (
    <div className="space-y-4 p-6 animate-pulse">
      <div className="h-8 w-1/4 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-32 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-32 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="h-64 rounded bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
