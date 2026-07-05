import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFoundPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="gap-sm flex flex-col items-center text-center">
        <p className="text-primary font-mono text-[48px] font-bold">404</p>
        <h1 className="text-h1 text-on-surface font-semibold">
          Page Not Found
        </h1>
        <p className="text-body-sm text-on-surface-variant max-w-sm">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-sm bg-primary px-md py-sm text-body-sm text-on-primary rounded font-medium transition-colors hover:bg-[#c01826]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
