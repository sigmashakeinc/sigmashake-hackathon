"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHackathon } from "@/core/hackathon";
import { createTemplateService, CATEGORY_LABELS, INITIAL_WIZARD_STATE, createWorkspaceFromTemplate, type WizardState, type WorkspaceTemplate } from "@/core/templates";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const { create: createHackathon } = useHackathon();
  const [wizard, setWizard] = useState<WizardState>(INITIAL_WIZARD_STATE);
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    createTemplateService().list().then(setTemplates).catch((err) => console.error("[Page] error:", err));
  }, []);

  function update(partial: Partial<WizardState>) {
    setWizard((w) => ({ ...w, ...partial }));
  }

  const featuredTemplates = templates.filter((t) => t.featured);
  const categoryTemplates = templates.filter((t) => !t.featured);

  async function handleCreate() {
    setError("");
    setIsCreating(true);
    try {
      const hackathon = await createHackathon({
        name: wizard.name || "Untitled Hackathon",
        organizer: wizard.organizer || "Owner",
        startDate: wizard.startDate || undefined,
        endDate: wizard.endDate || undefined,
        timezone: wizard.timezone,
        description: wizard.description || undefined,
        status: "active",
      });

      if (selectedTemplate) {
        await createWorkspaceFromTemplate(hackathon.id, selectedTemplate);
      }

      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace.");
      setIsCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-lg">
      <h1 className="mb-lg text-h1 font-semibold text-on-surface">Create Workspace</h1>

      {/* Step indicator */}
      <div className="mb-lg flex items-center gap-sm">
        {["source", "details", "review"].map((s, i) => (
          <div key={s} className="flex items-center gap-sm">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-mono font-medium ${
              wizard.step === s ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
            }`}>{i + 1}</div>
            <span className={`font-mono text-[10px] ${wizard.step === s ? "text-on-surface" : "text-on-surface-variant"}`}>
              {s === "source" ? "Source" : s === "details" ? "Details" : "Review"}
            </span>
            {i < 2 && <div className="h-px w-8 bg-outline-variant/50" />}
          </div>
        ))}
      </div>

      {/* Step: Source */}
      {wizard.step === "source" && (
        <div className="flex flex-col gap-lg">
          <p className="text-body-sm text-on-surface-variant">Choose how to create your workspace:</p>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <button type="button" onClick={() => update({ step: "details", source: "blank" })}
              className="rounded border border-outline-variant/30 bg-surface-container-low p-lg text-left transition-colors hover:bg-surface-container">
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant">add</span>
              <h3 className="mt-sm text-body-sm font-semibold text-on-surface">Blank Workspace</h3>
              <p className="mt-xs font-mono text-[10px] text-on-surface-variant">Start with a clean slate</p>
            </button>

            <button type="button" onClick={() => update({ step: "details", source: "template" })}
              className="rounded border border-outline-variant/30 bg-surface-container-low p-lg text-left transition-colors hover:bg-surface-container">
              <span className="material-symbols-outlined text-[24px] text-primary">dashboard_customize</span>
              <h3 className="mt-sm text-body-sm font-semibold text-on-surface">From Template</h3>
              <p className="mt-xs font-mono text-[10px] text-on-surface-variant">Use a pre-configured template</p>
            </button>
          </div>

          {/* Featured templates */}
          {featuredTemplates.length > 0 && (
            <div>
              <h2 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Popular Templates</h2>
              <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
                {featuredTemplates.map((t) => (
                  <button key={t.id} type="button" onClick={() => {
                    setSelectedTemplate(t);
                    update({ step: "details", source: "template", templateId: t.id, name: t.name, description: t.description ?? "" });
                  }}
                    className={`rounded border p-md text-left transition-colors ${
                      selectedTemplate?.id === t.id ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface-container-low hover:bg-surface-container"
                    }`}>
                    <p className="text-body-sm font-medium text-on-surface">{t.name}</p>
                    <p className="mt-xs font-mono text-[10px] text-on-surface-variant">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Template browser */}
          <div>
            <h2 className="mb-sm font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">All Templates</h2>
            <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
              {categoryTemplates.map((t) => (
                <button key={t.id} type="button" onClick={() => {
                  setSelectedTemplate(t);
                  update({ step: "details", source: "template", templateId: t.id, name: t.name, description: t.description ?? "" });
                }}
                  className={`rounded border p-md text-left transition-colors ${
                    selectedTemplate?.id === t.id ? "border-primary bg-primary/5" : "border-outline-variant/30 bg-surface-container-low hover:bg-surface-container"
                  }`}>
                  <p className="text-body-sm font-medium text-on-surface">{t.name}</p>
                  <p className="mt-xs font-mono text-[10px] text-on-surface-variant">{CATEGORY_LABELS[t.category]}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => update({ step: "details" })}
              className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Continue</button>
          </div>
        </div>
      )}

      {/* Step: Details */}
      {wizard.step === "details" && (
        <div className="flex flex-col gap-lg">
          <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
            <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Workspace Details</h2>
            <div className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Name</label>
                <input type="text" value={wizard.name} onChange={(e) => update({ name: e.target.value })}
                  placeholder="My Hackathon Workspace" required
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Organizer</label>
                <input type="text" value={wizard.organizer} onChange={(e) => update({ organizer: e.target.value })}
                  placeholder="Your name or team"
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Description</label>
                <textarea value={wizard.description} onChange={(e) => update({ description: e.target.value })}
                  rows={3} placeholder="What's this hackathon about?"
                  className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">Start Date</label>
                  <input type="date" value={wizard.startDate} onChange={(e) => update({ startDate: e.target.value })}
                    className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface">End Date</label>
                  <input type="date" value={wizard.endDate} onChange={(e) => update({ endDate: e.target.value })}
                    className="w-full rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          {selectedTemplate && (
            <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
              <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Selected Template</h2>
              <p className="text-body-sm font-medium text-on-surface">{selectedTemplate.name}</p>
              <p className="font-mono text-[10px] text-on-surface-variant">{selectedTemplate.description}</p>
            </div>
          )}

          {error && <p role="alert" className="rounded border border-error-container/30 bg-error-container/5 px-sm py-xs font-mono text-[10px] text-error">{error}</p>}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => update({ step: "source" })}
              className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface transition-colors hover:border-on-surface">Back</button>
            <button type="button" onClick={() => update({ step: "review" })}
              className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Continue</button>
          </div>
        </div>
      )}

      {/* Step: Review */}
      {wizard.step === "review" && (
        <div className="flex flex-col gap-lg">
          <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
            <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Review</h2>
            <div className="flex flex-col gap-xs font-mono text-[10px] text-on-surface-variant">
              <div className="flex justify-between"><span>Name</span><span className="text-on-surface">{wizard.name || "(not set)"}</span></div>
              <div className="flex justify-between"><span>Organizer</span><span className="text-on-surface">{wizard.organizer || "(not set)"}</span></div>
              <div className="flex justify-between"><span>Source</span><span className="text-on-surface">{wizard.source}</span></div>
              {selectedTemplate && <div className="flex justify-between"><span>Template</span><span className="text-on-surface">{selectedTemplate.name}</span></div>}
              {wizard.startDate && <div className="flex justify-between"><span>Start</span><span className="text-on-surface">{wizard.startDate}</span></div>}
              {wizard.endDate && <div className="flex justify-between"><span>End</span><span className="text-on-surface">{wizard.endDate}</span></div>}
            </div>
            {selectedTemplate?.config.deliverables && (
              <div className="mt-md">
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Deliverables</p>
                <div className="mt-xs flex flex-wrap gap-xs">
                  {selectedTemplate.config.deliverables.map((d) => (
                    <span key={d} className="rounded border border-outline-variant/30 px-xs py-[1px] font-mono text-[9px] text-on-surface-variant">{d}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => update({ step: "details" })}
              className="rounded border border-outline-variant bg-black px-md py-sm text-body-sm text-on-surface transition-colors hover:border-on-surface">Back</button>
            <button type="button" onClick={handleCreate} disabled={isCreating || !wizard.name.trim()}
              className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:opacity-50">
              {isCreating ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
