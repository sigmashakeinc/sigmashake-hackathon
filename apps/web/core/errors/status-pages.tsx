import Link from "next/link";

interface StatusPageProps {
  code: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

function StatusPage({ code, title, description, action }: StatusPageProps) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="gap-sm flex flex-col items-center text-center">
        <p className="text-primary font-mono text-[48px] font-bold">{code}</p>
        <h1 className="text-h1 text-on-surface font-semibold">{title}</h1>
        <p className="text-body-sm text-on-surface-variant max-w-sm">
          {description}
        </p>
        {action && (
          <Link
            href={action.href}
            className="mt-sm bg-primary px-md py-sm text-body-sm text-on-primary rounded font-medium transition-colors hover:bg-[#c01826]"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Page Not Found"
      description="The page you are looking for doesn't exist or has been moved."
      action={{ label: "Go Home", href: "/" }}
    />
  );
}

export function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="Access Denied"
      description="You don't have permission to access this resource."
      action={{ label: "Go Home", href: "/" }}
    />
  );
}

export function UnauthorizedPage() {
  return (
    <StatusPage
      code="401"
      title="Unauthorized"
      description="Please sign in to access this page."
      action={{ label: "Sign In", href: "/auth/login" }}
    />
  );
}

export function ServerErrorPage() {
  return (
    <StatusPage
      code="500"
      title="Server Error"
      description="An unexpected error occurred. Our team has been notified."
      action={{ label: "Try Again", href: "/" }}
    />
  );
}

export function MaintenancePage() {
  return (
    <StatusPage
      code="🔧"
      title="Under Maintenance"
      description="We are performing scheduled maintenance. We'll be back shortly."
    />
  );
}
