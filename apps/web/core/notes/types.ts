export type NoteCategory = "general" | "shared" | "personal" | "meeting" | "decision" | "checklist" | "quick_note" | "documentation" | "reference";

export type NoteType = "shared" | "personal";

export interface Note {
  id: string;
  hackathonId: string | null;
  userId: string | null;
  title: string;
  content: string | null;
  category: NoteCategory;
  noteType: NoteType;
  tags: string[] | null;
  colour: string | null;
  pinned: boolean;
  archived: boolean;
  favourite: boolean;
  author: string | null;
  linkedObjectiveId: string | null;
  linkedRequirementId: string | null;
  linkedIdeaId: string | null;
  linkedResearchId: string | null;
  linkedTaskId: string | null;
  linkedDeliverableId: string | null;
  wordCount: number;
  charCount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title?: string;
  content?: string;
  category?: NoteCategory;
  noteType?: NoteType;
  tags?: string[];
  colour?: string;
  pinned?: boolean;
  archived?: boolean;
  favourite?: boolean;
  author?: string;
  linkedObjectiveId?: string;
  linkedRequirementId?: string;
  linkedIdeaId?: string;
  linkedResearchId?: string;
  linkedTaskId?: string;
  linkedDeliverableId?: string;
}

export const NOTE_CATEGORIES: { label: string; value: NoteCategory }[] = [
  { label: "General", value: "general" },
  { label: "Shared", value: "shared" },
  { label: "Personal", value: "personal" },
  { label: "Meeting", value: "meeting" },
  { label: "Decision", value: "decision" },
  { label: "Checklist", value: "checklist" },
  { label: "Quick Note", value: "quick_note" },
  { label: "Documentation", value: "documentation" },
  { label: "Reference", value: "reference" },
];
