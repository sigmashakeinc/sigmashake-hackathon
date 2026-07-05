"use client";

import { useState } from "react";
import type { Comment } from "@/core/comments";

interface CommentCardProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  depth?: number;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function CommentCard({ comment, onReply, onEdit, onDelete, depth = 0 }: CommentCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [collapsed, setCollapsed] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;

  async function handleSaveEdit() {
    if (!onEdit || !editContent.trim() || editContent === comment.content) {
      setEditing(false);
      return;
    }
    await onEdit(comment.id, editContent.trim());
    setEditing(false);
  }

  return (
    <div className={`flex flex-col gap-[4px] ${depth > 0 ? "ml-lg border-l border-outline-variant/20 pl-sm" : ""}`}>
      <div className="flex items-start gap-sm rounded bg-surface-container-low p-sm">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/20 font-mono text-[9px] font-bold text-primary">
          {comment.createdBy.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-sm">
            <span className="font-mono text-[10px] font-medium text-on-surface">{comment.createdBy}</span>
            <span className="font-mono text-[9px] text-on-surface-variant">{formatTimeAgo(comment.createdAt)}</span>
            {comment.edited && <span className="font-mono text-[8px] text-on-surface-variant">(edited)</span>}
            {collapsed && hasReplies && (
              <button type="button" onClick={() => setCollapsed(false)} className="font-mono text-[9px] text-primary">
                {comment.replies!.length} repl{comment.replies!.length === 1 ? "y" : "ies"}
              </button>
            )}
          </div>
          {editing ? (
            <div className="mt-xs flex flex-col gap-xs">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded border border-outline-variant/20 bg-black px-sm py-xs text-body-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none"
                rows={3}
                aria-label="Edit comment"
              />
              <div className="flex gap-xs">
                <button type="button" onClick={handleSaveEdit} className="rounded bg-primary px-sm py-xs text-body-xs font-medium text-on-primary">Save</button>
                <button type="button" onClick={() => { setEditing(false); setEditContent(comment.content); }} className="rounded border border-outline-variant/30 px-sm py-xs text-body-xs text-on-surface-variant">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-body-xs text-on-surface-variant whitespace-pre-wrap">{comment.content}</p>
          )}
          <div className="mt-xs flex items-center gap-sm">
            <button type="button" onClick={() => onReply(comment.id)} className="font-mono text-[9px] text-on-surface-variant hover:text-primary transition-colors">Reply</button>
            {onEdit && <button type="button" onClick={() => setEditing(true)} className="font-mono text-[9px] text-on-surface-variant hover:text-primary transition-colors">Edit</button>}
            {onDelete && <button type="button" onClick={() => onDelete(comment.id)} className="font-mono text-[9px] text-error/70 hover:text-error transition-colors">Delete</button>}
            {hasReplies && !collapsed && (
              <button type="button" onClick={() => setCollapsed(true)} className="font-mono text-[9px] text-on-surface-variant">
                Hide replies
              </button>
            )}
          </div>
        </div>
      </div>

      {!collapsed && comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col gap-[4px]">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} onReply={onReply} onEdit={onEdit} onDelete={onDelete} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
