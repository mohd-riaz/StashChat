export function SkeletonLines() {
  return (
    <div className="space-y-2">
      <div className="h-3.5 w-64 rounded bg-muted animate-pulse" />
      <div className="h-3.5 w-80 rounded bg-muted animate-pulse" />
      <div className="h-3.5 w-48 rounded bg-muted animate-pulse" />
    </div>
  );
}

export function SkeletonModelLabel() {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
      <div className="size-3 rounded-sm bg-muted animate-pulse opacity-50 shrink-0" />
      <div className="h-3 w-24 rounded bg-muted animate-pulse" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="group flex w-full max-w-[95%] flex-col gap-2 is-assistant">
      <SkeletonModelLabel />
      <div className="flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm text-foreground">
        <SkeletonLines />
      </div>
    </div>
  );
}
