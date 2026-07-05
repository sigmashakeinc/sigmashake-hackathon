export default function LoadingPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="gap-sm flex flex-col items-center">
        <div className="gap-sm flex items-center">
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
        </div>
        <p className="text-body-sm text-on-surface-variant">Loading...</p>
      </div>
    </div>
  );
}
