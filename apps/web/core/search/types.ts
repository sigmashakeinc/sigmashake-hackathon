export type SearchModule =
  | "tasks" | "ideas" | "research" | "notes" | "files" | "planning"
  | "objectives" | "milestones" | "deliverables" | "requirements"
  | "hackathons" | "team" | "submission" | "settings";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  module: SearchModule;
  icon: string;
  href: string;
  type: string;
}

export interface Command {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  shortcut?: string;
}
