import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, AuthPageShell } from "@/components/auth";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <AuthPageShell>
      <AuthCard>
        <h1 className="text-h2 mb-sm text-on-surface font-semibold">
          Privacy Policy
        </h1>
        <div className="gap-lg text-body-sm text-on-surface-variant flex flex-col">
          <p>
            SSG-Hackathon is a private collaborative workstation for invited
            team members. We collect only the minimum information necessary to
            operate the workspace.
          </p>
          <div>
            <h2 className="mb-xs text-on-surface font-semibold">
              Data We Collect
            </h2>
            <ul className="pl-lg list-disc">
              <li>Account information (email, username, display name)</li>
              <li>Workspace activity (tasks, ideas, submissions)</li>
              <li>Usage data for operational purposes</li>
            </ul>
          </div>
          <div>
            <h2 className="mb-xs text-on-surface font-semibold">
              Data Sharing
            </h2>
            <p>
              We do not sell or share your personal data with third parties.
              Data is stored securely on Supabase infrastructure.
            </p>
          </div>
          <div>
            <h2 className="mb-xs text-on-surface font-semibold">Contact</h2>
            <p>For privacy inquiries, contact the workspace owner.</p>
          </div>
        </div>
        <div className="mt-sm border-outline-variant pt-md border-t">
          <Link
            href="/login"
            className="text-body-sm text-primary transition-opacity hover:opacity-80"
          >
            Back to Sign In
          </Link>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}
