import { getSupabaseServerClient, getSupabaseBrowserClient } from "@/services/supabase";
import type { FileRecord, Folder, FileCategory } from "./types";

function mapFile(d: Record<string, unknown>): FileRecord {
  return {
    id: String(d.id ?? ""), hackathonId: String(d.hackathon_id ?? ""),
    folderId: (d.folder_id as string) ?? null, name: String(d.name ?? ""),
    originalName: String(d.original_name ?? ""), description: (d.description as string) ?? null,
    category: (d.category as FileCategory) ?? "other", mimeType: String(d.mime_type ?? ""),
    fileSize: Number(d.file_size ?? 0), storagePath: String(d.storage_path ?? ""),
    checksum: (d.checksum as string) ?? null, thumbnailUrl: (d.thumbnail_url as string) ?? null,
    tags: (d.tags as string[]) ?? null, uploader: (d.uploader as string) ?? null,
    pinned: Boolean(d.pinned), archived: Boolean(d.archived), favourite: Boolean(d.favourite),
    version: Number(d.version ?? 1),
    referencedObjectiveId: (d.referenced_objective_id as string) ?? null,
    referencedRequirementId: (d.referenced_requirement_id as string) ?? null,
    referencedIdeaId: (d.referenced_idea_id as string) ?? null,
    referencedResearchId: (d.referenced_research_id as string) ?? null,
    referencedTaskId: (d.referenced_task_id as string) ?? null,
    referencedNoteId: (d.referenced_note_id as string) ?? null,
    referencedDeliverableId: (d.referenced_deliverable_id as string) ?? null,
    createdAt: String(d.created_at ?? ""), updatedAt: String(d.updated_at ?? ""),
  };
}

export function createFileService() {
  const supabase = getSupabaseServerClient();

  return {
    async listFiles(hackathonId: string, folderId?: string | null, includeArchived = false) {
      let q = supabase.from("files").select("*").eq("hackathon_id", hackathonId);
      if (folderId !== undefined) { if (folderId) q = q.eq("folder_id", folderId); else q = q.is("folder_id", null); }
      if (!includeArchived) q = q.eq("archived", false);
      q = q.order("pinned", { ascending: false }).order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r) => mapFile(r as Record<string, unknown>));
    },

    async listFolders(hackathonId: string, parentId?: string | null) {
      let q = supabase.from("folders").select("*").eq("hackathon_id", hackathonId).order("name");
      if (parentId !== undefined) { if (parentId) q = q.eq("parent_id", parentId); else q = q.is("parent_id", null); }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r: Record<string, unknown>) => ({
        id: String(r.id ?? ""), hackathonId: String(r.hackathon_id ?? ""),
        name: String(r.name ?? ""), parentId: (r.parent_id as string) ?? null,
        createdAt: String(r.created_at ?? ""),
      })) as Folder[];
    },

    async createFolder(hackathonId: string, name: string, parentId?: string | null) {
      const { data, error } = await supabase.from("folders").insert({
        hackathon_id: hackathonId, name, parent_id: parentId ?? null,
      } as never).select().single();
      if (error) throw error;
      return data as unknown as Folder;
    },

    async renameFolder(id: string, name: string) {
      const { error } = await supabase.from("folders").update({ name } as never).eq("id", id);
      if (error) throw error;
    },

    async deleteFolder(id: string) {
      // Move files to root, then delete folder
      await supabase.from("files").update({ folder_id: null } as never).eq("folder_id", id);
      const { error } = await supabase.from("folders").delete().eq("id", id);
      if (error) throw error;
    },

    async deleteFile(id: string) {
      const file = await this.getFile(id);
      if (!file) return;
      // Delete from storage
      const { error: storageError } = await getSupabaseBrowserClient().storage
        .from("attachments").remove([file.storagePath]);
      if (storageError) console.error("Storage delete error:", storageError);
      // Delete metadata
      const { error } = await supabase.from("files").delete().eq("id", id);
      if (error) throw error;
    },

    async getFile(id: string) {
      const { data, error } = await supabase.from("files").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? mapFile(data as Record<string, unknown>) : null;
    },

    // File metadata updates
    async updateFile(id: string, updates: Record<string, unknown>) {
      const { error } = await supabase.from("files").update(updates as never).eq("id", id);
      if (error) throw error;
    },

    // Upload to Supabase Storage + record metadata
    async upload(hackathonId: string, file: File, folderId?: string | null, onProgress?: (pct: number) => void) {
      const path = `${hackathonId}/${Date.now()}_${file.name}`;
      const bucket = getSupabaseBrowserClient().storage.from("attachments");

      const { error: uploadError } = await bucket.upload(path, file, {
        cacheControl: "3600", upsert: false,
      });
      if (uploadError) throw uploadError;
      if (onProgress) onProgress(100);

      const cat = this.guessCategory(file.type, file.name);

      const { error: dbError } = await supabase.from("files").insert({
        hackathon_id: hackathonId, folder_id: folderId ?? null,
        name: file.name, original_name: file.name,
        category: cat, mime_type: file.type, file_size: file.size,
        storage_path: path,
      } as never);
      if (dbError) throw dbError;

      return path;
    },

    guessCategory(mime: string, name: string): string {
      if (mime.startsWith("image/")) return "image";
      if (mime.startsWith("video/")) return "video";
      if (mime.startsWith("audio/")) return "audio";
      if (mime === "application/pdf") return "pdf";
      if (mime.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return "word";
      if (mime.includes("excel") || name.endsWith(".xls") || name.endsWith(".xlsx")) return "excel";
      if (mime.includes("powerpoint") || name.endsWith(".ppt") || name.endsWith(".pptx")) return "powerpoint";
      if (name.endsWith(".md")) return "markdown";
      if (name.endsWith(".zip") || name.endsWith(".rar") || name.endsWith(".7z") || name.endsWith(".tar.gz")) return "archive";
      if (mime === "application/json" || name.endsWith(".json")) return "json";
      if (name.endsWith(".csv")) return "csv";
      if (mime.startsWith("text/")) return "text";
      return "other";
    },
  };
}
