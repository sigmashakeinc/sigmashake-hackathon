"use client";

import { useState } from "react";
import type { Retrospective, RetrospectiveInput } from "@/core/retrospectives";

interface RetrospectiveEditorProps {
  retrospective: Retrospective | null;
  onSave: (input: RetrospectiveInput) => Promise<void>;
}

const SECTIONS: { key: keyof RetrospectiveInput; label: string; placeholder: string }[] = [
  { key: "wentWell", label: "What went well", placeholder: "Things that worked well..." },
  { key: "wentBadly", label: "What went badly", placeholder: "Things that didn't work..." },
  { key: "problems", label: "Problems", placeholder: "Issues encountered..." },
  { key: "successes", label: "Successes", placeholder: "Big wins..." },
  { key: "improvements", label: "Things to improve", placeholder: "What to do differently..." },
];

const TEXT_FIELDS: { key: keyof RetrospectiveInput & ("teamFeedback" | "technicalFeedback" | "planningFeedback" | "submissionFeedback"); label: string }[] = [
  { key: "teamFeedback", label: "Team Feedback" },
  { key: "technicalFeedback", label: "Technical Feedback" },
  { key: "planningFeedback", label: "Planning Feedback" },
  { key: "submissionFeedback", label: "Submission Feedback" },
];

export function RetrospectiveEditor({ retrospective, onSave }: RetrospectiveEditorProps) {
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    if (retrospective) {
      init.wentWell = retrospective.wentWell;
      init.wentBadly = retrospective.wentBadly;
      init.problems = retrospective.problems;
      init.successes = retrospective.successes;
      init.improvements = retrospective.improvements;
    }
    SECTIONS.forEach((s) => { if (!init[s.key]) init[s.key] = []; });
    return init;
  });

  const [texts, setTexts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (retrospective) {
      init.teamFeedback = retrospective.teamFeedback ?? "";
      init.technicalFeedback = retrospective.technicalFeedback ?? "";
      init.planningFeedback = retrospective.planningFeedback ?? "";
      init.submissionFeedback = retrospective.submissionFeedback ?? "";
    }
    TEXT_FIELDS.forEach((f) => { if (!init[f.key]) init[f.key] = ""; });
    return init;
  });

  const [score, setScore] = useState(retrospective?.overallScore ?? 5);

  function addItem(key: string) {
    setItems((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), ""] }));
  }

  function updateItem(key: string, idx: number, value: string) {
    setItems((prev) => {
      const arr = [...(prev[key] ?? [])];
      arr[idx] = value;
      return { ...prev, [key]: arr };
    });
  }

  function removeItem(key: string, idx: number) {
    setItems((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((_, i) => i !== idx),
    }));
  }

  async function handleSave() {
    setSaving(true);
    const cleaned: Record<string, string[]> = {};
    for (const [key, arr] of Object.entries(items)) {
      cleaned[key] = arr.filter((v) => v.trim());
    }

    await onSave({
      ...cleaned as unknown as RetrospectiveInput,
      teamFeedback: texts.teamFeedback || undefined,
      technicalFeedback: texts.technicalFeedback || undefined,
      planningFeedback: texts.planningFeedback || undefined,
      submissionFeedback: texts.submissionFeedback || undefined,
      overallScore: score,
    });
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {retrospective ? "Edit Retrospective" : "Create Retrospective"}
        </h3>
        <div className="flex items-center gap-sm">
          <div className="flex items-center gap-xs">
            <span className="font-mono text-[10px] text-on-surface-variant">Score:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setScore(n)}
                className={`flex h-6 w-6 items-center justify-center rounded font-mono text-[10px] transition-colors ${
                  score === n
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                }`}
                aria-label={`Score ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex h-7 items-center rounded bg-primary px-sm text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
        {SECTIONS.map((section) => (
          <div key={section.key} className="rounded border border-outline-variant/20 bg-surface-container-low p-sm">
            <div className="mb-xs flex items-center justify-between">
              <h4 className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                {section.label}
              </h4>
              <button
                type="button"
                onClick={() => addItem(section.key)}
                className="flex h-5 w-5 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high transition-colors"
                aria-label={`Add ${section.label}`}
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
              </button>
            </div>
            <div className="flex flex-col gap-[4px]">
              {(items[section.key] ?? []).map((val, idx) => (
                <div key={idx} className="flex items-center gap-[4px]">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateItem(section.key, idx, e.target.value)}
                    placeholder={section.placeholder}
                    className="h-7 flex-1 rounded border border-outline-variant/20 bg-black px-sm font-mono text-[10px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                    aria-label={`${section.label} item ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(section.key, idx)}
                    className="flex h-5 w-5 items-center justify-center rounded text-on-surface-variant/50 hover:text-error transition-colors"
                    aria-label="Remove"
                  >
                    <span className="material-symbols-outlined text-[12px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
        {TEXT_FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-[4px]">
            <label className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
              {field.label}
            </label>
            <textarea
              value={texts[field.key] ?? ""}
              onChange={(e) => setTexts((prev) => ({ ...prev, [field.key]: e.target.value }))}
              rows={3}
              className="rounded border border-outline-variant/20 bg-black px-sm py-xs font-mono text-[10px] text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none"
              aria-label={field.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
