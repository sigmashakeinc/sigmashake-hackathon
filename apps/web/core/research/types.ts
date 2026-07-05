export type ResearchCategory =
  | "frontend" | "backend" | "infrastructure" | "authentication" | "database"
  | "devops" | "ui" | "ux" | "design" | "api" | "ai" | "machine_learning"
  | "security" | "testing" | "deployment" | "general";

export type ResearchSourceType =
  | "website" | "documentation" | "api" | "github" | "package" | "library"
  | "video" | "course" | "article" | "pdf" | "research_paper" | "blog"
  | "tool" | "service" | "dataset" | "image" | "example" | "general";

export type VerificationStatus = "verified" | "needs_review" | "deprecated";

export interface ResearchItem {
  id: string;
  hackathonId: string;
  title: string;
  summary: string | null;
  description: string | null;
  category: ResearchCategory;
  sourceType: ResearchSourceType;
  url: string | null;
  author: string | null;
  addedBy: string | null;
  tags: string[] | null;
  pinned: boolean;
  archived: boolean;
  verified: boolean;
  favourite: boolean;
  verificationStatus: VerificationStatus;
  rating: number | null;
  notes: string | null;
  referencedIdeaId: string | null;
  referencedObjectiveId: string | null;
  referencedRequirementId: string | null;
  referencedMilestoneId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchInput {
  title: string;
  summary?: string;
  description?: string;
  category?: ResearchCategory;
  sourceType?: ResearchSourceType;
  url?: string;
  author?: string;
  tags?: string[];
  rating?: number;
  notes?: string;
  referencedIdeaId?: string;
  referencedObjectiveId?: string;
  referencedRequirementId?: string;
  referencedMilestoneId?: string;
}

export const RESEARCH_CATEGORIES: { label: string; value: ResearchCategory }[] = [
  { label: "Frontend", value: "frontend" }, { label: "Backend", value: "backend" },
  { label: "Infrastructure", value: "infrastructure" }, { label: "Authentication", value: "authentication" },
  { label: "Database", value: "database" }, { label: "DevOps", value: "devops" },
  { label: "UI", value: "ui" }, { label: "UX", value: "ux" }, { label: "Design", value: "design" },
  { label: "API", value: "api" }, { label: "AI", value: "ai" }, { label: "ML", value: "machine_learning" },
  { label: "Security", value: "security" }, { label: "Testing", value: "testing" },
  { label: "Deployment", value: "deployment" }, { label: "General", value: "general" },
];

export const RESEARCH_SOURCE_TYPES: { label: string; value: ResearchSourceType }[] = [
  { label: "Website", value: "website" }, { label: "Documentation", value: "documentation" },
  { label: "API", value: "api" }, { label: "GitHub", value: "github" },
  { label: "Package", value: "package" }, { label: "Library", value: "library" },
  { label: "Video", value: "video" }, { label: "Course", value: "course" },
  { label: "Article", value: "article" }, { label: "PDF", value: "pdf" },
  { label: "Research Paper", value: "research_paper" }, { label: "Blog", value: "blog" },
  { label: "Tool", value: "tool" }, { label: "Service", value: "service" },
  { label: "Dataset", value: "dataset" }, { label: "Image", value: "image" },
  { label: "Example", value: "example" }, { label: "General", value: "general" },
];
