export type RelationshipType =
  | "related" | "depends_on" | "implements" | "validates" | "references"
  | "generated_from" | "blocks" | "duplicate_of" | "parent" | "child"
  | "supports" | "documents" | "attachment";

export type RelationshipModule =
  | "hackathon" | "objective" | "milestone" | "deliverable" | "requirement"
  | "risk" | "decision" | "idea" | "research" | "task" | "note" | "file"
  | "submission" | "team_member" | "template";

export interface Relationship {
  id: string;
  hackathonId: string | null;
  sourceModule: string;
  sourceId: string;
  targetModule: string;
  targetId: string;
  relationshipType: RelationshipType;
  createdAt: string;
}

export const MODULE_LABELS: Record<string, string> = {
  hackathon: "Hackathon", objective: "Objective", milestone: "Milestone",
  deliverable: "Deliverable", requirement: "Requirement", risk: "Risk",
  decision: "Decision", idea: "Idea", research: "Research", task: "Task",
  note: "Note", file: "File", submission: "Submission", team_member: "Team Member",
  template: "Template",
};

export const RELATIONSHIP_LABELS: Record<string, string> = {
  related: "Related", depends_on: "Depends On", implements: "Implements",
  validates: "Validates", references: "References", generates: "Generated From",
  generated_from: "Generated From", blocks: "Blocks", duplicate_of: "Duplicate Of",
  parent: "Parent", child: "Child", supports: "Supports", documents: "Documents",
  attachment: "Attachment",
};

export interface RelationshipNode {
  id: string;
  module: string;
  label: string;
  type: string;
  x: number;
  y: number;
}

export interface RelationshipEdge {
  source: string;
  target: string;
  type: RelationshipType;
}
