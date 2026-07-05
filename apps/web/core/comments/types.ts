export interface CommentThread {
  id: string;
  hackathonId: string;
  module: string;
  moduleId: string;
  title: string | null;
  pinned: boolean;
  resolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

export interface Comment {
  id: string;
  threadId: string;
  parentId: string | null;
  content: string;
  createdBy: string;
  edited: boolean;
  editedAt: string | null;
  createdAt: string;
  replies?: Comment[];
}

export interface Mention {
  id: string;
  commentId: string;
  mentionedUserId: string;
  mentionedUsername: string;
  read: boolean;
  createdAt: string;
}

export interface CommentInput {
  content: string;
  parentId?: string;
}

export interface ThreadInput {
  module: string;
  moduleId: string;
  title?: string;
}

export const SUPPORTED_MODULES = [
  "planning", "objectives", "requirements", "milestones", "deliverables",
  "ideas", "research", "tasks", "notes", "files",
  "submission", "relationships", "archive",
] as const;

export type CommentModule = typeof SUPPORTED_MODULES[number];
