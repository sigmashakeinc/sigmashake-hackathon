import { getSupabaseServerClient } from "@/services/supabase";
import type { CommentThread, Comment, Mention, ThreadInput, CommentInput } from "./types";

export function createCommentService() {
  function client() {
    return getSupabaseServerClient();
  }

  async function getThreads(module: string, moduleId: string): Promise<CommentThread[]> {
    const { data } = await client()
      .from("comment_threads")
      .select("*")
      .eq("module", module)
      .eq("module_id", moduleId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    return ((data ?? []) as Record<string, unknown>[]).map(mapThreadRow);
  }

  async function createThread(hackathonId: string, input: ThreadInput, userId: string): Promise<CommentThread> {
    const { data } = await client()
      .from("comment_threads")
      .insert({
        hackathon_id: hackathonId,
        module: input.module,
        module_id: input.moduleId,
        title: input.title ?? null,
        created_by: userId,
      } as never)
      .select()
      .single() as never;

    return data as unknown as CommentThread;
  }

  async function resolveThread(threadId: string, userId: string): Promise<void> {
    await client()
      .from("comment_threads")
      .update({ resolved: true, resolved_by: userId, resolved_at: new Date().toISOString() } as never)
      .eq("id", threadId) as never;
  }

  async function reopenThread(threadId: string): Promise<void> {
    await client()
      .from("comment_threads")
      .update({ resolved: false, resolved_by: null, resolved_at: null } as never)
      .eq("id", threadId) as never;
  }

  async function togglePin(threadId: string, pinned: boolean): Promise<void> {
    await client()
      .from("comment_threads")
      .update({ pinned } as never)
      .eq("id", threadId) as never;
  }

  async function getComments(threadId: string): Promise<Comment[]> {
    const { data } = await client()
      .from("comments")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    const rows = ((data ?? []) as Record<string, unknown>[]).map(mapCommentRow);

    const byId = new Map<string, Comment>();
    const roots: Comment[] = [];
    for (const c of rows) {
      byId.set(c.id, c);
      if (!c.parentId) {
        roots.push(c);
      }
    }
    for (const c of rows) {
      if (c.parentId) {
        const parent = byId.get(c.parentId);
        if (parent) {
          parent.replies = parent.replies ?? [];
          parent.replies.push(c);
        }
      }
    }
    return roots;
  }

  async function createComment(threadId: string, input: CommentInput, userId: string): Promise<Comment> {
    const { data } = await client()
      .from("comments")
      .insert({
        thread_id: threadId,
        parent_id: input.parentId ?? null,
        content: input.content,
        created_by: userId,
      } as never)
      .select()
      .single() as never;

    return data as unknown as Comment;
  }

  async function editComment(commentId: string, content: string): Promise<void> {
    await client()
      .from("comments")
      .update({ content, edited: true, edited_at: new Date().toISOString() } as never)
      .eq("id", commentId) as never;
  }

  async function deleteComment(commentId: string): Promise<void> {
    await client()
      .from("comments")
      .delete()
      .eq("id", commentId) as never;
  }

  async function getMentions(userId: string): Promise<Mention[]> {
    const { data } = await client()
      .from("mentions")
      .select("*, comment:comments!inner(content, thread_id, comment_threads!inner(module, module_id))")
      .eq("mentioned_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    return ((data ?? []) as Record<string, unknown>[]).map(mapMentionRow);
  }

  async function getUnreadMentionCount(userId: string): Promise<number> {
    const { count } = await client()
      .from("mentions")
      .select("id", { count: "exact", head: true })
      .eq("mentioned_user_id", userId)
      .eq("read", false) as never;

    return (count as number) ?? 0;
  }

  async function markMentionRead(mentionId: string): Promise<void> {
    await client()
      .from("mentions")
      .update({ read: true } as never)
      .eq("id", mentionId) as never;
  }

  return { getThreads, createThread, resolveThread, reopenThread, togglePin, getComments, createComment, editComment, deleteComment, getMentions, getUnreadMentionCount, markMentionRead };
}

function mapThreadRow(row: Record<string, unknown>): CommentThread {
  return {
    id: row.id as string,
    hackathonId: row.hackathon_id as string,
    module: row.module as string,
    moduleId: row.module_id as string,
    title: row.title as string | null,
    pinned: (row.pinned as boolean) ?? false,
    resolved: (row.resolved as boolean) ?? false,
    resolvedBy: row.resolved_by as string | null,
    resolvedAt: row.resolved_at as string | null,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapCommentRow(row: Record<string, unknown>): Comment {
  return {
    id: row.id as string,
    threadId: row.thread_id as string,
    parentId: row.parent_id as string | null,
    content: row.content as string,
    createdBy: row.created_by as string,
    edited: (row.edited as boolean) ?? false,
    editedAt: row.edited_at as string | null,
    createdAt: row.created_at as string,
  };
}

function mapMentionRow(row: Record<string, unknown>): Mention {
  return {
    id: row.id as string,
    commentId: row.comment_id as string,
    mentionedUserId: row.mentioned_user_id as string,
    mentionedUsername: row.mentioned_username as string,
    read: (row.read as boolean) ?? false,
    createdAt: row.created_at as string,
  };
}
