export interface Objective {
  id: string;
  hackathonId: string;
  title: string;
  description: string | null;
  priority: "critical" | "high" | "medium" | "low";
  status: "draft" | "active" | "completed" | "cancelled";
  owner: string | null;
  targetDate: string | null;
  tags: string[] | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  hackathonId: string;
  name: string;
  description: string | null;
  dueDate: string | null;
  status: "pending" | "in_progress" | "completed" | "delayed" | "cancelled";
  completionPct: number;
  dependencies: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  hackathonId: string;
  name: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  owner: string | null;
  notes: string | null;
  deadline: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Requirement {
  id: string;
  hackathonId: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: "critical" | "high" | "medium" | "low";
  source: string | null;
  status: "draft" | "approved" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: string;
  hackathonId: string;
  risk: string;
  likelihood: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  mitigation: string | null;
  owner: string | null;
  status: "identified" | "mitigated" | "accepted" | "resolved";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  hackathonId: string;
  title: string;
  decision: string | null;
  reasoning: string | null;
  alternatives: string | null;
  author: string | null;
  status: "proposed" | "accepted" | "deprecated" | "superseded";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistTemplate {
  id: string;
  hackathonId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  templateId: string;
  label: string;
  checked: boolean;
  assignedTo: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanningNote {
  id: string;
  hackathonId: string;
  title: string;
  content: string | null;
  createdBy: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type PlanningEntity =
  | "objectives"
  | "milestones"
  | "deliverables"
  | "requirements"
  | "risks"
  | "decisions"
  | "checklists"
  | "notes";

export interface PlanningCounts {
  objectives: { total: number; completed: number };
  milestones: { total: number; completed: number };
  deliverables: { total: number; completed: number };
  risks: { total: number; active: number };
  decisions: { total: number; accepted: number };
}
