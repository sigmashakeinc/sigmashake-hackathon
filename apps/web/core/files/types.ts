export type FileCategory = "image" | "video" | "audio" | "pdf" | "word" | "excel" | "powerpoint" | "markdown" | "archive" | "code" | "json" | "csv" | "text" | "binary" | "other";

export interface FileRecord {
  id: string;
  hackathonId: string;
  folderId: string | null;
  name: string;
  originalName: string;
  description: string | null;
  category: FileCategory;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  checksum: string | null;
  thumbnailUrl: string | null;
  tags: string[] | null;
  uploader: string | null;
  pinned: boolean;
  archived: boolean;
  favourite: boolean;
  version: number;
  referencedObjectiveId: string | null;
  referencedRequirementId: string | null;
  referencedIdeaId: string | null;
  referencedResearchId: string | null;
  referencedTaskId: string | null;
  referencedNoteId: string | null;
  referencedDeliverableId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  hackathonId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export const CATEGORY_ICONS: Record<string, string> = {
  image: "image", video: "smart_display", audio: "audio_file",
  pdf: "picture_as_pdf", word: "description", excel: "table_chart",
  powerpoint: "slideshow", markdown: "code", archive: "folder_zip",
  code: "code", json: "data_object", csv: "table_rows",
  text: "article", binary: "settings", other: "insert_drive_file",
};

export const FILE_CATEGORIES: { label: string; value: FileCategory }[] = [
  { label: "Image", value: "image" }, { label: "Video", value: "video" },
  { label: "Audio", value: "audio" }, { label: "PDF", value: "pdf" },
  { label: "Word", value: "word" }, { label: "Excel", value: "excel" },
  { label: "PowerPoint", value: "powerpoint" }, { label: "Markdown", value: "markdown" },
  { label: "Archive", value: "archive" }, { label: "Code", value: "code" },
  { label: "JSON", value: "json" }, { label: "CSV", value: "csv" },
  { label: "Text", value: "text" }, { label: "Binary", value: "binary" },
  { label: "Other", value: "other" },
];
