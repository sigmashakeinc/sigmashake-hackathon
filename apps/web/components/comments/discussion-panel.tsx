"use client";

import { useState, useEffect, useCallback } from "react";
import { createCommentService, type Comment, type CommentThread } from "@/core/comments";
import { CommentCard } from "./comment-card";

interface DiscussionPanelProps {
  hackathonId: string;
  module: string;
  moduleId: string;
  userId: string;
  title?: string;
}

export function DiscussionPanel({ hackathonId, module, moduleId, userId, title }: DiscussionPanelProps) {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [activeThread, setActiveThread] = useState<CommentThread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [threadTitle, setThreadTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const commentSvc = createCommentService();

  const loadThreads = useCallback(async () => {
    setLoading(true);
    const t = await commentSvc.getThreads(module, moduleId);
    setThreads(t);
    setLoading(false);
  }, [module, moduleId, commentSvc]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  async function loadComments(thread: CommentThread) {
    setActiveThread(thread);
    const c = await commentSvc.getComments(thread.id);
    setComments(c);
  }

  async function handleCreateThread() {
    if (!threadTitle.trim()) return;
    const thread = await commentSvc.createThread(hackathonId, { module, moduleId, title: threadTitle.trim() }, userId);
    setThreads((prev) => [thread, ...prev]);
    setShowNewThread(false);
    setThreadTitle("");
    setActiveThread(thread);
    setComments([]);
  }

  async function handleAddComment() {
    if (!activeThread || !newComment.trim()) return;
    const c = await commentSvc.createComment(
      activeThread.id,
      { content: newComment.trim(), parentId: replyTo ?? undefined },
      userId
    );
    setComments((prev) => [...prev, c]);
    setNewComment("");
    setReplyTo(null);
  }

  function handleReply(parentId: string) {
    setReplyTo(parentId);
    setNewComment("");
  }

  async function handleDeleteComment(commentId: string) {
    await commentSvc.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId && !c.replies?.some((r) => r.id === commentId)));
  }

  async function handleResolve(threadId: string) {
    await commentSvc.resolveThread(threadId, userId);
    setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, resolved: true, resolvedBy: userId } : t));
  }

  async function handleReopen(threadId: string) {
    await commentSvc.reopenThread(threadId);
    setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, resolved: false, resolvedBy: null } : t));
  }

  return (
    <div className="flex flex-col gap-sm rounded border border-outline-variant/30 bg-surface-container-low p-md">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {title ?? "Discussion"}
          <span className="ml-xs text-on-surface-variant/50">({threads.length})</span>
        </h3>
        <button
          type="button"
          onClick={() => setShowNewThread(!showNewThread)}
          className="flex h-7 items-center rounded bg-primary px-sm text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826]"
        >
          {showNewThread ? "Cancel" : "New Thread"}
        </button>
      </div>

      {showNewThread && (
        <div className="flex gap-xs">
          <input
            type="text"
            placeholder="Thread title..."
            value={threadTitle}
            onChange={(e) => setThreadTitle(e.target.value)}
            className="h-8 flex-1 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            aria-label="Thread title"
          />
          <button
            type="button"
            onClick={handleCreateThread}
            disabled={!threadTitle.trim()}
            className="flex h-8 items-center rounded bg-primary px-sm text-body-xs font-medium text-on-primary disabled:pointer-events-none disabled:opacity-50"
          >
            Create
          </button>
        </div>
      )}

      {/* Thread list */}
      {!activeThread && (
        <div className="flex flex-col gap-xs">
          {loading ? (
            <div className="flex items-center gap-sm py-sm">
              <div className="bg-primary h-1 w-1 animate-pulse rounded-full" />
              <div className="bg-primary h-1 w-1 animate-pulse rounded-full [animation-delay:150ms]" />
              <div className="bg-primary h-1 w-1 animate-pulse rounded-full [animation-delay:300ms]" />
            </div>
          ) : threads.length === 0 ? (
            <p className="py-sm text-center font-mono text-[10px] text-on-surface-variant">No discussions yet.</p>
          ) : threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => loadComments(thread)}
              className="flex items-center gap-sm rounded bg-surface-container p-sm text-left transition-colors hover:bg-surface-container-high"
            >
              <span className={`material-symbols-outlined text-[14px] ${thread.resolved ? "text-[#3fb950]" : "text-on-surface-variant"}`}>
                {thread.resolved ? "check_circle" : thread.pinned ? "keep" : "chat_bubble_outline"}
              </span>
              <span className="flex-1 font-mono text-[10px] text-on-surface">{thread.title ?? "Untitled"}</span>
              {thread.pinned && <span className="font-mono text-[8px] text-primary">Pinned</span>}
              {thread.resolved && <span className="font-mono text-[8px] text-[#3fb950]">Resolved</span>}
            </button>
          ))}
        </div>
      )}

      {/* Active thread */}
      {activeThread && (
        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => { setActiveThread(null); setComments([]); setReplyTo(null); }} className="flex items-center gap-xs font-mono text-[10px] text-primary transition-opacity hover:opacity-80">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Back to threads
            </button>
            <div className="flex gap-xs">
              {!activeThread.resolved ? (
                <button type="button" onClick={() => handleResolve(activeThread.id)} className="font-mono text-[9px] text-[#3fb950] hover:opacity-80">Resolve</button>
              ) : (
                <button type="button" onClick={() => handleReopen(activeThread.id)} className="font-mono text-[9px] text-on-surface-variant hover:text-on-surface">Reopen</button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[4px]">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={async (id, content) => { await commentSvc.editComment(id, content); }}
                onDelete={handleDeleteComment}
              />
            ))}
            {comments.length === 0 && (
              <p className="py-sm text-center font-mono text-[10px] text-on-surface-variant">No comments yet. Start the discussion.</p>
            )}
          </div>

          <div className="flex gap-xs">
            <input
              type="text"
              placeholder={replyTo ? "Write a reply..." : "Write a comment... (@mention)"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
              className="h-8 flex-1 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              aria-label="New comment"
            />
            <button
              type="button"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="flex h-8 items-center rounded bg-primary px-sm text-body-xs font-medium text-on-primary disabled:pointer-events-none disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
