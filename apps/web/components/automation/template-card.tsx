"use client";

import { TRIGGER_LABELS, ACTION_LABELS, type AutomationTemplate } from "@/core/automation";

interface TemplateCardProps {
  template: AutomationTemplate;
  onApply: (template: AutomationTemplate) => void;
}

export function TemplateCard({ template, onApply }: TemplateCardProps) {
  return (
    <div className="flex items-center gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-sm transition-colors hover:bg-surface-container-high">
      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
        <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium text-on-surface">{template.name}</p>
        <p className="font-mono text-[9px] text-on-surface-variant">{TRIGGER_LABELS[template.triggerType]} → {ACTION_LABELS[template.actionType]}</p>
      </div>
      <button type="button" onClick={() => onApply(template)} className="rounded bg-primary px-sm py-xs text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826]">
        Apply
      </button>
    </div>
  );
}
