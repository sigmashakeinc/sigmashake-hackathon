export type LessonSeverity = "critical" | "important" | "insight" | "tip";

export interface Lesson {
  id: string;
  archiveId: string;
  title: string;
  content: string;
  category: string;
  severity: LessonSeverity;
  tags: string[];
  pinned: boolean;
  favourite: boolean;
  referencesModule: string | null;
  referencesId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonInput {
  title: string;
  content: string;
  category?: string;
  severity?: LessonSeverity;
  tags?: string[];
  pinned?: boolean;
  favourite?: boolean;
  referencesModule?: string;
  referencesId?: string;
}
