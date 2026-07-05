export type TaskStatus = "backlog" | "todo" | "in_progress" | "blocked" | "review" | "testing" | "done" | "archived";

export type TaskPriority = "critical" | "high" | "medium" | "low";

export type TaskSeverity = "critical" | "high" | "medium" | "low" | "trivial";

export interface TaskChecklistItem {
  id: string;
  taskId: string;
  label: string;
  checked: boolean;
  assignedTo: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Task {
  id: string;
  hackathonId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  severity: TaskSeverity;
  difficulty: number | null;
  estimatedHours: number | null;
  actualHours: number | null;
  owner: string | null;
  assignees: string[] | null;
  reviewer: string | null;
  createdBy: string | null;
  dueDate: string | null;
  startDate: string | null;
  completedDate: string | null;
  labels: string[] | null;
  tags: string[] | null;
  blocked: boolean;
  archived: boolean;
  parentTaskId: string | null;
  sortOrder: number;
  referencedObjectiveId: string | null;
  referencedRequirementId: string | null;
  referencedMilestoneId: string | null;
  referencedDeliverableId: string | null;
  referencedIdeaId: string | null;
  referencedResearchId: string | null;
  createdAt: string;
  updatedAt: string;
  checklistItems?: TaskChecklistItem[];
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  severity?: TaskSeverity;
  difficulty?: number;
  estimatedHours?: number;
  owner?: string;
  assignees?: string[];
  reviewer?: string;
  dueDate?: string;
  startDate?: string;
  labels?: string[];
  tags?: string[];
  parentTaskId?: string;
  referencedObjectiveId?: string;
  referencedRequirementId?: string;
  referencedMilestoneId?: string;
  referencedDeliverableId?: string;
  referencedIdeaId?: string;
  referencedResearchId?: string;
}

export const TASK_STATUSES: { label: string; value: TaskStatus; column: string }[] = [
  { label: "Backlog", value: "backlog", column: "Backlog" },
  { label: "Todo", value: "todo", column: "To Do" },
  { label: "In Progress", value: "in_progress", column: "In Progress" },
  { label: "Blocked", value: "blocked", column: "Blocked" },
  { label: "Review", value: "review", column: "Review" },
  { label: "Testing", value: "testing", column: "Testing" },
  { label: "Done", value: "done", column: "Done" },
  { label: "Archived", value: "archived", column: "Archived" },
];

export const TASK_STATUS_VALUES = TASK_STATUSES.map((s) => s.value);

const statusColors: Record<string, string> = {
  backlog: "bg-surface-container text-on-surface-variant",
  todo: "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/5",
  in_progress: "text-primary border-primary/30 bg-primary/5",
  blocked: "text-error border-error/30 bg-error/5",
  review: "text-[#d29922] border-[#d29922]/30 bg-[#d29922]/5",
  testing: "text-[#d29922] border-[#d29922]/30 bg-[#d29922]/10",
  done: "text-[#3fb950] border-[#3fb950]/30 bg-[#3fb950]/10",
  archived: "text-on-surface-variant border-surface-variant bg-surface-container",
};

export function getStatusStyle(status: string): string {
  return (statusColors[status] as string) ?? (statusColors.backlog as string);
}
