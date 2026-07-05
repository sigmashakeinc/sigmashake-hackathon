export type IdeaStatus = "draft" | "open" | "in_discussion" | "approved" | "rejected" | "archived" | "implemented";

export type IdeaPriority = "low" | "medium" | "high" | "critical";

export type IdeaCategory =
  | "feature" | "technical" | "design" | "ui" | "ux"
  | "backend" | "frontend" | "infrastructure" | "devops"
  | "research" | "business" | "general";

export interface Idea {
  id: string;
  hackathonId: string;
  title: string;
  description: string | null;
  summary: string | null;
  category: IdeaCategory;
  customCategory: string | null;
  status: IdeaStatus;
  priority: IdeaPriority;
  author: string | null;
  owner: string | null;
  tags: string[] | null;
  colour: string | null;
  pinned: boolean;
  archived: boolean;
  voteCount: number;
  referencedObjectiveId: string | null;
  referencedRequirementId: string | null;
  referencedMilestoneId: string | null;
  convertedToTask: boolean;
  convertedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaInput {
  title: string;
  description?: string;
  summary?: string;
  category?: IdeaCategory;
  customCategory?: string;
  status?: IdeaStatus;
  priority?: IdeaPriority;
  author?: string;
  owner?: string;
  tags?: string[];
  colour?: string;
  referencedObjectiveId?: string;
  referencedRequirementId?: string;
  referencedMilestoneId?: string;
}

export const IDEA_CATEGORIES: { label: string; value: IdeaCategory }[] = [
  { label: "Feature", value: "feature" },
  { label: "Technical", value: "technical" },
  { label: "Design", value: "design" },
  { label: "UI", value: "ui" },
  { label: "UX", value: "ux" },
  { label: "Backend", value: "backend" },
  { label: "Frontend", value: "frontend" },
  { label: "Infrastructure", value: "infrastructure" },
  { label: "DevOps", value: "devops" },
  { label: "Research", value: "research" },
  { label: "Business", value: "business" },
  { label: "General", value: "general" },
];

export const IDEA_STATUSES: { label: string; value: IdeaStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Open", value: "open" },
  { label: "In Discussion", value: "in_discussion" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
  { label: "Implemented", value: "implemented" },
];

export const IDEA_PRIORITIES: { label: string; value: IdeaPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];
