"use client";

import { TRIGGER_LABELS, ACTION_LABELS, type AutomationRule } from "@/core/automation";

interface RuleCardProps {
  rule: AutomationRule;
  onToggle: (id: string, enabled: boolean) => void;
  onRun: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RuleCard({ rule, onToggle, onRun, onDelete }: RuleCardProps) {
  return (
    <div className={`flex flex-col gap-sm rounded border p-sm transition-colors ${
      rule.enabled
        ? "border-outline-variant/30 bg-surface-container-low"
        : "border-outline-variant/10 bg-surface-container-low/50 opacity-60"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={() => onToggle(rule.id, !rule.enabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              rule.enabled ? "bg-primary" : "bg-surface-variant"
            }`}
            role="switch"
            aria-checked={rule.enabled}
            aria-label={`Toggle ${rule.name}`}
          >
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
              rule.enabled ? "translate-x-[18px]" : "translate-x-[2px]"
            }`} />
          </button>
          <div>
            <p className="text-body-sm font-medium text-on-surface">{rule.name}</p>
            {rule.description && <p className="font-mono text-[9px] text-on-surface-variant">{rule.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-xs">
          <span className="rounded bg-surface-container-high px-[4px] py-[1px] font-mono text-[8px] text-on-surface-variant">{rule.mode}</span>
          <span className="font-mono text-[9px] text-on-surface-variant">{rule.runCount} runs</span>
          <button type="button" onClick={() => onRun(rule.id)} className="flex h-6 w-6 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface" aria-label="Run now">
            <span className="material-symbols-outlined text-[14px]">play_arrow</span>
          </button>
          <button type="button" onClick={() => onDelete(rule.id)} className="flex h-6 w-6 items-center justify-center rounded text-on-surface-variant/50 hover:text-error" aria-label="Delete">
            <span className="material-symbols-outlined text-[14px]">delete</span>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-md font-mono text-[9px] text-on-surface-variant">
        <span>When: {TRIGGER_LABELS[rule.triggerType] ?? rule.triggerType}</span>
        <span>→</span>
        <span>Then: {ACTION_LABELS[rule.actionType] ?? rule.actionType}</span>
      </div>
    </div>
  );
}
