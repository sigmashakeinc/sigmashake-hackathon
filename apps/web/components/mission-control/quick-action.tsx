import Link from "next/link";

interface QuickActionProps {
  href: string;
  icon: string;
  label: string;
}

export function QuickAction({ href, icon, label }: QuickActionProps) {
  return (
    <Link href={href}
      className="flex items-center gap-sm rounded px-sm py-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label}
    </Link>
  );
}
