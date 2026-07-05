"use client";

import { useState, useEffect } from "react";
import { createRelationshipService, MODULE_LABELS, RELATIONSHIP_LABELS, type Relationship } from "@/core/relationships";

interface RelationshipPanelProps {
  module: string;
  id: string;
}

export function RelationshipPanel({ module, id }: RelationshipPanelProps) {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    createRelationshipService().getForSource(module, id).then(setRelationships).catch((err) => console.error("[Page] error:", err));
  }, [isOpen, module, id]);

  return (
    <div className="relative">
      <button type="button" onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-xs rounded border border-outline-variant bg-black px-sm py-xs font-mono text-[10px] text-on-surface-variant transition-colors hover:border-on-surface">
        <span className="material-symbols-outlined text-[14px]">hub</span>
        Links
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-40 mt-xs w-80 rounded border border-outline-variant bg-surface-container-low shadow-lg">
          <div className="border-b border-outline-variant/30 px-md py-sm">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Relationships</h3>
          </div>
          <div className="max-h-60 overflow-y-auto p-xs scrollbar-thin">
            {relationships.length === 0 ? (
              <p className="px-md py-sm font-mono text-[10px] text-on-surface-variant">No links yet</p>
            ) : (
              relationships.map((rel) => {
                const isSource = rel.sourceModule === module && rel.sourceId === id;
                const otherModule = isSource ? rel.targetModule : rel.sourceModule;
                const _otherId = isSource ? rel.targetId : rel.sourceId; void _otherId;
                return (
                  <div key={rel.id} className="flex items-center gap-sm rounded px-md py-sm transition-colors hover:bg-surface-container-high">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${rel.relationshipType === "blocks" ? "bg-error" : "bg-primary"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[9px] text-on-surface-variant">{MODULE_LABELS[otherModule] ?? otherModule}</p>
                      <p className="font-mono text-[9px] text-on-surface-variant">{RELATIONSHIP_LABELS[rel.relationshipType]}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="border-t border-outline-variant/30 px-md py-sm">
            <button type="button" onClick={() => setIsOpen(false)}
              className="font-mono text-[9px] text-on-surface-variant transition-colors hover:text-on-surface">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
