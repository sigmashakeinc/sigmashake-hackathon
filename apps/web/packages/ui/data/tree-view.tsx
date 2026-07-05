"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/packages/utils";

interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  expanded?: boolean;
}

interface TreeViewProps {
  nodes: TreeNode[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
  renderIcon?: (node: TreeNode, expanded: boolean) => ReactNode;
}

function TreeItem({
  node,
  depth,
  selectedId,
  onSelect,
  renderIcon,
}: {
  node: TreeNode;
  depth: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
  renderIcon?: (node: TreeNode, expanded: boolean) => ReactNode;
}) {
  const [expanded, setExpanded] = useState(node.expanded ?? true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded((v) => !v);
          onSelect?.(node.id);
        }}
        className={cn(
          "gap-xs px-sm text-body-sm flex w-full items-center rounded py-[6px] transition-colors",
          "border-l-2",
          isSelected
            ? "border-l-primary bg-surface-container-high text-primary font-medium"
            : "text-on-surface hover:bg-surface-container-highest border-l-transparent",
        )}
      >
        {hasChildren ? (
          <span
            className={cn(
              "material-symbols-outlined text-on-surface-variant text-[14px] transition-transform",
              expanded && "rotate-90",
            )}
          >
            chevron_right
          </span>
        ) : (
          <span className="w-[14px]" />
        )}
        {renderIcon ? (
          renderIcon(node, expanded)
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
            {hasChildren
              ? expanded
                ? "folder_open"
                : "folder"
              : (node.icon ?? "description")}
          </span>
        )}
        <span className="truncate">{node.label}</span>
      </button>
      {hasChildren && expanded && (
        <div className="border-surface-variant pl-xs ml-[14px] border-l">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              renderIcon={renderIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeView({
  nodes,
  selectedId,
  onSelect,
  className,
  renderIcon,
}: TreeViewProps) {
  return (
    <div className={cn("flex flex-col gap-[2px]", className)} role="tree">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
          renderIcon={renderIcon}
        />
      ))}
    </div>
  );
}
