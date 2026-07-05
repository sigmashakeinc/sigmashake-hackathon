export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export const sidebarNav: NavItem[] = [
  { label: "Mission Control", href: "/app", icon: "dashboard" },
  { label: "My Workspace", href: "/app/me", icon: "person" },
  { label: "Notifications", href: "/app/notifications", icon: "notifications" },
  { label: "Discover", href: "/app/discover", icon: "travel_explore" },
  { label: "Planning", href: "/app/planning", icon: "map" },
  { label: "Ideas", href: "/app/ideas", icon: "lightbulb" },
  { label: "Research", href: "/app/research", icon: "science" },
  { label: "Tasks", href: "/app/tasks", icon: "checklist" },
  { label: "Notes", href: "/app/notes", icon: "note" },
  { label: "Files", href: "/app/files", icon: "folder" },
  { label: "Relationships", href: "/app/relationships", icon: "hub" },
  { label: "Analytics", href: "/app/analytics", icon: "insights" },
  { label: "Automation", href: "/app/automation", icon: "auto_awesome" },
  { label: "Team", href: "/app/team", icon: "group" },
  { label: "Submission Prep", href: "/app/submission-prep", icon: "task_alt" },
  { label: "Hackathons", href: "/app/hackathons", icon: "emoji_events" },
  { label: "Archive", href: "/app/archive", icon: "archive" },
  { label: "Integrations", href: "/app/integrations", icon: "extension" },
];

export const secondaryNav: NavItem[] = [
  { label: "Admin", href: "/app/admin", icon: "admin_panel_settings" },
  { label: "Settings", href: "/app/settings", icon: "settings" },
];
