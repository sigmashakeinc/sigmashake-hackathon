"use client";

import { useState, useEffect, useCallback } from "react";
import { useHackathon } from "@/core/hackathon";
import { createAutomationService, type AutomationRule, type AutomationTemplate, type AutomationRun, TRIGGER_TYPES, TRIGGER_LABELS, ACTION_TYPES, ACTION_LABELS, type TriggerType, type ActionType } from "@/core/automation";
import { RuleCard, TemplateCard, RunHistory } from "@/components/automation";

type Section = "overview" | "rules" | "templates" | "history";

export default function AutomationPage() {
  const { activeHackathon } = useHackathon();
  const [section, setSection] = useState<Section>("overview");
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRule, setShowNewRule] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState<TriggerType>("task_completed");
  const [newAction, setNewAction] = useState<ActionType>("create_notification");
  const [newMode, setNewMode] = useState<"automatic" | "manual">("automatic");

  const hackathonId = activeHackathon?.id;
  const auto = createAutomationService();

  const load = useCallback(async () => {
    if (!hackathonId) return;
    setLoading(true);
    const [r, t, runsData] = await Promise.all([
      auto.listRules(hackathonId),
      auto.listTemplates(),
      auto.getRecentRuns(hackathonId),
    ]);
    setRules(r);
    setTemplates(t);
    setRuns(runsData);
    setLoading(false);
  }, [hackathonId, auto]);

  useEffect(() => { load(); }, [load]);

  async function handleCreateRule() {
    if (!hackathonId || !newName.trim()) return;
    await auto.createRule({
      hackathonId,
      name: newName.trim(),
      triggerType: newTrigger,
      actionType: newAction,
      mode: newMode,
    });
    setNewName("");
    setShowNewRule(false);
    load();
  }

  async function handleToggle(id: string, enabled: boolean) {
    await auto.toggleRule(id, enabled);
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled } : r));
  }

  async function handleRun(id: string) {
    if (!hackathonId) return;
    await auto.executeRule(id, hackathonId);
    load();
  }

  async function handleDelete(id: string) {
    await auto.deleteRule(id);
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleApplyTemplate(template: AutomationTemplate) {
    if (!hackathonId) return;
    await auto.createRule({
      hackathonId,
      name: template.name,
      description: template.description ?? undefined,
      triggerType: template.triggerType,
      actionType: template.actionType,
      triggerConfig: template.triggerConfig,
      actionConfig: template.actionConfig,
    });
    load();
  }

  if (!hackathonId) {
    return <div className="flex items-center justify-center p-lg"><p className="text-body-sm text-on-surface-variant">Select a hackathon to configure automation.</p></div>;
  }

  const enabledRules = rules.filter((r) => r.enabled);
  const recentRuns = runs.filter((r) => r.status === "completed").length;
  const failedRuns = runs.filter((r) => r.status === "failed").length;

  return (
    <div className="mx-auto max-w-5xl p-lg">
      <h1 className="mb-sm text-h1 font-semibold text-on-surface">Automation</h1>
      <p className="mb-lg text-body-sm text-on-surface-variant">
        {rules.length > 0 ? `${enabledRules.length} active rule${enabledRules.length !== 1 ? "s" : ""} · ${recentRuns} completed · ${failedRuns} failed` : "Automate your workflow"}
      </p>

      <nav className="mb-lg flex gap-xs" aria-label="Sections">
        {([
          { id: "overview" as const, label: "Overview", icon: "dashboard" },
          { id: "rules" as const, label: `Rules (${rules.length})`, icon: "rule" },
          { id: "templates" as const, label: "Templates", icon: "auto_awesome" },
          { id: "history" as const, label: `History (${runs.length})`, icon: "history" },
        ]).map((s) => (
          <button key={s.id} type="button" onClick={() => setSection(s.id)}
            className={`flex items-center gap-xs rounded px-sm py-xs text-body-xs font-medium transition-all ${
              section === s.id ? "bg-primary text-on-primary" : "border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60"
            }`}>
            <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </nav>

      {loading && (
        <div className="flex items-center justify-center py-xl">
          <div className="flex items-center gap-sm">
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
            <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
          </div>
        </div>
      )}

      {!loading && section === "overview" && (
        <div className="grid grid-cols-1 gap-sm md:grid-cols-3">
          <div className="rounded border border-outline-variant/20 bg-surface-container-low p-md text-center">
            <p className="text-[32px] font-bold text-on-surface">{enabledRules.length}</p>
            <p className="font-mono text-[10px] text-on-surface-variant">Active Rules</p>
          </div>
          <div className="rounded border border-outline-variant/20 bg-surface-container-low p-md text-center">
            <p className="text-[32px] font-bold text-[#3fb950]">{recentRuns}</p>
            <p className="font-mono text-[10px] text-on-surface-variant">Completed Runs</p>
          </div>
          <div className="rounded border border-outline-variant/20 bg-surface-container-low p-md text-center">
            <p className={`text-[32px] font-bold ${failedRuns > 0 ? "text-error" : "text-on-surface"}`}>{failedRuns}</p>
            <p className="font-mono text-[10px] text-on-surface-variant">Failed Runs</p>
          </div>
        </div>
      )}

      {!loading && section === "rules" && (
        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Automation Rules</h2>
            <button type="button" onClick={() => setShowNewRule(!showNewRule)} className="flex h-7 items-center rounded bg-primary px-sm text-body-xs font-medium text-on-primary transition-colors hover:bg-[#c01826]">
              {showNewRule ? "Cancel" : "New Rule"}
            </button>
          </div>

          {showNewRule && (
            <div className="flex flex-col gap-sm rounded border border-outline-variant/30 bg-surface-container p-md">
              <input type="text" placeholder="Rule name" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="h-8 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface focus:border-primary focus:outline-none" aria-label="Rule name" />
              <div className="flex gap-sm">
                <select value={newTrigger} onChange={(e) => setNewTrigger(e.target.value as TriggerType)}
                  className="h-8 flex-1 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface focus:border-primary focus:outline-none" aria-label="Trigger">
                  {TRIGGER_TYPES.map((t) => <option key={t} value={t}>{TRIGGER_LABELS[t]}</option>)}
                </select>
                <select value={newAction} onChange={(e) => setNewAction(e.target.value as ActionType)}
                  className="h-8 flex-1 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface focus:border-primary focus:outline-none" aria-label="Action">
                  {ACTION_TYPES.map((a) => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
                </select>
                <select value={newMode} onChange={(e) => setNewMode(e.target.value as "automatic" | "manual")}
                  className="h-8 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface focus:border-primary focus:outline-none" aria-label="Mode">
                  <option value="automatic">Auto</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <button type="button" onClick={handleCreateRule} disabled={!newName.trim()}
                className="self-start rounded bg-primary px-md py-sm text-body-xs font-medium text-on-primary disabled:opacity-50">Create Rule</button>
            </div>
          )}

          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} onToggle={handleToggle} onRun={handleRun} onDelete={handleDelete} />
          ))}
          {rules.length === 0 && <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">No rules yet. Create one or use a template.</p>}
        </div>
      )}

      {!loading && section === "templates" && (
        <div className="flex flex-col gap-sm">
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Built-in Templates ({templates.length})</h2>
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} onApply={handleApplyTemplate} />
          ))}
        </div>
      )}

      {!loading && section === "history" && (
        <div className="flex flex-col gap-sm">
          <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Recent Runs</h2>
          <RunHistory runs={runs} />
        </div>
      )}
    </div>
  );
}
