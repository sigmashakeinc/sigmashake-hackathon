"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="gap-sm flex flex-col items-center text-center">
        <p className="text-primary font-mono text-[48px] font-bold">500</p>
        <h1 className="text-h1 text-on-surface font-semibold">Server Error</h1>
        <p className="text-body-sm text-on-surface-variant max-w-sm">
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-sm bg-primary px-md py-sm text-body-sm text-on-primary rounded font-medium transition-colors hover:bg-[#c01826]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
