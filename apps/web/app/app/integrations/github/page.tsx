"use client";

import { useState, useEffect, useCallback } from "react";
import { useHackathon } from "@/core/hackathon";
import { useAuth } from "@/identity";
import { createGitHubService, type GitHubConnection, type GitHubRepository, type GitHubIssue, type GitHubPR, type GitHubCommit, type GitHubBranch, type GitHubWorkflow, type GitHubRelease, type ValidationResult, type AuthType } from "@/core/github";

type Section = "overview" | "repositories" | "issues" | "pulls" | "branches" | "commits" | "actions" | "releases" | "settings" | "history" | "setup";

export default function GitHubIntegrationPage() {
  const { activeHackathon } = useHackathon();
  const { user, session, signInWithOAuth, getGitHubToken } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("setup");
  const [connection, setConnection] = useState<GitHubConnection | null>(null);
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [pulls, setPulls] = useState<GitHubPR[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [workflows, setWorkflows] = useState<GitHubWorkflow[]>([]);
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [syncHistory, setSyncHistory] = useState<{ id: string; syncType: string; status: string; itemsProcessed: number; errorMessage: string | null; startedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Setup wizard state
  const [authType, setAuthType] = useState<AuthType>("oauth");
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [availableRepos, setAvailableRepos] = useState<{ full_name: string; owner: string }[]>([]);
  const [selectedFullName, setSelectedFullName] = useState("");
  const [enabledFeatures, setEnabledFeatures] = useState({
    issues: true, pulls: true, actions: true, releases: true, commits: true,
  });
  const [syncing, setSyncing] = useState(false);
  const [setupGuideVisible, setSetupGuideVisible] = useState(false);
  const [oauthAttempted, setOauthAttempted] = useState(false);

  const hackathonId = activeHackathon?.id;
  const gh = createGitHubService();

  const loadData = useCallback(async () => {
    if (!hackathonId) return;
    setLoading(true);
    const conn = await gh.getConnection(hackathonId);
    setConnection(conn);
    if (conn) {
      const repoList = await gh.getRepositories(hackathonId);
      setRepos(repoList);
      if (repoList.length > 0) {
        setSelectedRepo(repoList[0] ?? null);
        const history = await gh.getSyncHistory(conn.id);
        setSyncHistory(history);
      }
      setActiveSection("overview");
    }
    setLoading(false);
  }, [hackathonId, gh]);

  useEffect(() => { loadData(); }, [loadData]);

  // Check if returning from GitHub OAuth — retrieve provider_token
  useEffect(() => {
    if (!connection && session.providerToken && !oauthAttempted) {
      setOauthAttempted(true);
      setToken(session.providerToken);
      setAuthType("oauth");
      setValidation({
        valid: true,
        owner: session.user?.username ?? null,
        repository: null,
        scopes: [],
        errors: [],
      });
      // Load repos with OAuth token
      gh.fetchUserRepos(session.providerToken).then(setAvailableRepos).catch((err) => console.error("[Page] error:", err));
      setStep(2);
    }
  }, [session, connection, oauthAttempted, gh]);

  async function handleOAuthConnect() {
    await signInWithOAuth("github");
  }

  async function handleValidateToken() {
    if (!token.trim()) return;
    const result = await gh.validateToken(token.trim());
    setValidation(result);
    if (result.valid) {
      const repos = await gh.fetchUserRepos(token.trim());
      setAvailableRepos(repos);
      setStep(2);
    }
  }

  async function handleConnect() {
    if (!hackathonId || !user || !selectedFullName) return;
    setSyncing(true);

    let ghToken = token.trim();
    let conn: GitHubConnection;

    if (authType === "oauth") {
      // OAuth: get token from session, store connection without token
      ghToken = session.providerToken ?? "";
      if (!ghToken) return;
      conn = await gh.saveOAuthConnection(hackathonId, user.username ?? "", "repo,read:org,read:user", user.id);
    } else {
      // PAT: save connection with token
      if (!ghToken) return;
      conn = await gh.saveConnection(hackathonId, authType, ghToken, user.id);
    }

    const parts = selectedFullName.split("/");
    const owner = parts[0] ?? "";
    const name = parts[1] ?? "";
    const repoData = await gh.fetchRepoData(ghToken, owner, name);
    await gh.saveRepository(conn.id, hackathonId, repoData);
    await gh.recordSync(conn.id, "initial_sync", "completed", 1);
    setConnection(conn);
    setSyncing(false);
    await loadData();
    await loadData();
  }

  async function handleSync() {
    if (!connection || !selectedRepo) return;
    setSyncing(true);
    const { owner, name } = selectedRepo;

    let ghToken = connection.authType === "oauth" ? session.providerToken : connection.accessToken;
    if (!ghToken) return;

    if (connection.authType === "oauth") {
      const freshToken = await getGitHubToken();
      if (freshToken) ghToken = freshToken;
    }

    try {
      await gh.recordSync(connection.id, "repo_metadata", "running");

      if (enabledFeatures.issues) {
        const items = await gh.fetchIssues(ghToken, owner, name);
        setIssues(items);
      }
      if (enabledFeatures.pulls) {
        const items = await gh.fetchPRs(ghToken, owner, name);
        setPulls(items);
      }
      if (enabledFeatures.commits) {
        const items = await gh.fetchCommits(ghToken, owner, name);
        setCommits(items);
      }
      const branchItems = await gh.fetchBranches(ghToken, owner, name);
      setBranches(branchItems);
      if (enabledFeatures.actions) {
        const items = await gh.fetchWorkflows(ghToken, owner, name);
        setWorkflows(items);
      }
      if (enabledFeatures.releases) {
        const items = await gh.fetchReleases(ghToken, owner, name);
        setReleases(items);
      }

      await gh.recordSync(connection.id, "full_sync", "completed", 1);
    } catch (e) {
      await gh.recordSync(connection.id, "full_sync", "failed", 0, (e as Error).message);
    }
    const history = await gh.getSyncHistory(connection.id);
    setSyncHistory(history);
    setSyncing(false);
  }

  async function handleDisconnect() {
    if (!connection) return;
    await gh.deleteConnection(connection.id);
    setConnection(null);
    setRepos([]);
    setSelectedRepo(null);
    setIssues([]);
    setPulls([]);
    setCommits([]);
    setBranches([]);
    setWorkflows([]);
    setReleases([]);
    setActiveSection("setup");
  }

  function selectRepo(repo: GitHubRepository) {
    setSelectedRepo(repo);
    setActiveSection("overview");
  }

  const sections: { id: Section; label: string; icon: string }[] = connection ? [
    { id: "overview", label: "Overview", icon: "info" },
    { id: "repositories", label: "Repositories", icon: "folder" },
    { id: "issues", label: "Issues", icon: "bug_report" },
    { id: "pulls", label: "Pull Requests", icon: "merge" },
    { id: "branches", label: "Branches", icon: "call_split" },
    { id: "commits", label: "Commits", icon: "commit" },
    { id: "actions", label: "Actions", icon: "play_circle" },
    { id: "releases", label: "Releases", icon: "new_releases" },
    { id: "settings", label: "Settings", icon: "settings" },
    { id: "history", label: "Sync History", icon: "history" },
  ] : [];

  const hackathonIdVal = hackathonId;

  if (!hackathonIdVal) {
    return <div className="flex items-center justify-center p-lg"><p className="text-body-sm text-on-surface-variant">Select a hackathon to configure GitHub integration.</p></div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-lg">
        <div className="flex items-center gap-sm">
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
          <div className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-lg">
      <div className="mb-lg flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-on-surface">GitHub Integration</h1>
          <div className="flex items-center gap-sm">
            <p className="text-body-sm text-on-surface-variant">
              {connection ? `Connected · ${repos.length} repositor${repos.length === 1 ? "y" : "ies"}` : "Not configured"}
            </p>
            {connection && (
              <span className={`rounded px-[4px] py-[1px] font-mono text-[8px] font-medium ${connection.authType === "oauth" ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                {connection.authType === "oauth" ? "OAuth" : "PAT"}
              </span>
            )}
          </div>
        </div>
        {connection && (
          <button type="button" onClick={handleSync} disabled={syncing || !selectedRepo}
            className="flex items-center gap-xs rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:pointer-events-none disabled:opacity-50">
            <span className={`material-symbols-outlined text-[16px] ${syncing ? "animate-spin" : ""}`}>sync</span>
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        )}
      </div>

      {/* Setup Wizard */}
      {!connection && (
        <div className="flex flex-col gap-lg">
          {!setupGuideVisible ? (
            <div className="rounded border border-outline-variant/30 bg-surface-container p-lg">
              <h2 className="mb-md text-h3 font-semibold text-on-surface">Setup Guide</h2>
              <div className="mb-md flex flex-col gap-sm text-body-sm text-on-surface-variant">
                <p>Connect your GitHub account to link repositories, track issues, pull requests, and more.</p>
                <p className="mt-sm"><strong className="text-on-surface">GitHub OAuth</strong> is the recommended method — one click, no tokens needed.</p>
                <p>For advanced use cases, <strong className="text-on-surface">Personal Access Tokens</strong> let you connect organisation repositories or use fine-grained permissions.</p>
              </div>
              <button type="button" onClick={() => setSetupGuideVisible(true)} className="rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">Start Setup</button>
            </div>
          ) : (
            <div className="flex flex-col gap-md rounded border border-outline-variant/30 bg-surface-container p-lg">
              <h2 className="text-h3 font-semibold text-on-surface">Connect GitHub</h2>

              <div className="flex flex-col gap-sm">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Step 1: Choose Authentication</p>
                <div className="flex gap-sm">
                  <button type="button" onClick={() => setAuthType("oauth")} className={`flex-1 rounded border p-md text-center transition-colors ${authType === "oauth" ? "border-primary bg-primary/10" : "border-outline-variant/30 hover:border-outline-variant/60"}`}>
                    <span className="material-symbols-outlined text-[24px] text-primary">key</span>
                    <p className="mt-xs text-body-sm font-medium text-on-surface">GitHub OAuth</p>
                    <p className="font-mono text-[8px] text-primary">Recommended</p>
                  </button>
                  <button type="button" onClick={() => setAuthType("pat")} className={`flex-1 rounded border p-md text-center transition-colors ${authType === "pat" ? "border-primary bg-primary/10" : "border-outline-variant/30 hover:border-outline-variant/60"}`}>
                    <span className="material-symbols-outlined text-[24px] text-on-surface-variant">lock</span>
                    <p className="mt-xs text-body-sm font-medium text-on-surface">Personal Access Token</p>
                    <p className="font-mono text-[8px] text-on-surface-variant">Advanced</p>
                  </button>
                </div>

                {authType === "oauth" ? (
                  <div className="flex flex-col gap-sm">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Step 2: Authorise</p>
                    <button type="button" onClick={handleOAuthConnect} className="self-start rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826]">
                      Connect with GitHub
                    </button>
                    <p className="font-mono text-[9px] text-on-surface-variant">You&apos;ll be redirected to GitHub to authorise access.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-sm">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Step 2: Personal Access Token</p>
                    <p className="font-mono text-[9px] text-on-surface-variant">Create a classic token at GitHub Settings &gt; Developer settings &gt; Personal access tokens with <code className="rounded bg-surface-container-high px-[4px]">repo</code> and <code className="rounded bg-surface-container-high px-[4px]">read:org</code> scopes.</p>
                    <label className="font-mono text-[9px] text-on-surface-variant">GitHub Token</label>
                    <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_xxxxxxxxxxxx" className="h-8 rounded border border-outline-variant/30 bg-black px-sm font-mono text-[10px] text-on-surface focus:border-primary focus:outline-none" aria-label="GitHub token" />
                    <button type="button" onClick={handleValidateToken} disabled={!token.trim()} className="self-start rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:pointer-events-none disabled:opacity-50">Validate Token</button>
                    {validation && (
                      <div className={`rounded p-sm font-mono text-[10px] ${validation.valid ? "bg-[#3fb950]/10 text-[#3fb950]" : "bg-error/10 text-error"}`}>
                        {validation.valid ? `Valid — Authenticated as @${validation.owner}` : `Error: ${validation.errors.join(", ")}`}
                      </div>
                    )}
                  </div>
                )}

              {step >= 2 && validation?.valid && (
                <div className="flex flex-col gap-sm">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{authType === "oauth" ? "Step 2" : "Step 3"}: Select Repository</p>
                  <select value={selectedFullName} onChange={(e) => setSelectedFullName(e.target.value)} className="h-8 rounded border border-outline-variant/30 bg-black px-sm text-body-xs text-on-surface focus:border-primary focus:outline-none" aria-label="Select repository">
                    <option value="">Choose a repository...</option>
                    {availableRepos.map((r) => <option key={r.full_name} value={r.full_name}>{r.full_name}</option>)}
                  </select>
                </div>
              )}

              {step >= 2 && selectedFullName && (
                <div className="flex flex-col gap-sm">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{authType === "oauth" ? "Step 3" : "Step 4"}: Enabled Features</p>
                  <div className="flex flex-wrap gap-sm">
                    {(["issues", "pulls", "actions", "releases", "commits"] as const).map((f) => (
                      <label key={f} className="flex items-center gap-xs cursor-pointer">
                        <input type="checkbox" checked={enabledFeatures[f]} onChange={() => setEnabledFeatures((prev) => ({ ...prev, [f]: !prev[f] }))} className="text-primary border-outline-variant rounded bg-black focus:ring-primary" />
                        <span className="font-mono text-[10px] text-on-surface">{f.charAt(0).toUpperCase() + f.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step >= 2 && selectedFullName && (
                <button type="button" onClick={handleConnect} disabled={syncing} className="self-start rounded bg-primary px-md py-sm text-body-sm font-medium text-on-primary transition-colors hover:bg-[#c01826] disabled:pointer-events-none disabled:opacity-50">
                  {syncing ? "Connecting..." : "Complete Setup"}
                </button>
              )}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Connected view */}
      {connection && (
        <>
          {/* Repo Selector */}
          <div className="mb-lg flex flex-wrap items-center gap-xs">
            {repos.map((r) => (
              <button key={r.id} type="button" onClick={() => selectRepo(r)}
                className={`rounded px-sm py-xs text-body-xs font-medium transition-all ${
                  selectedRepo?.id === r.id ? "bg-primary text-on-primary" : "border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60"
                }`}>{r.fullName}</button>
            ))}
            <button type="button" onClick={() => setActiveSection("repositories")} className="rounded border border-dashed border-outline-variant/30 px-sm py-xs text-body-xs text-on-surface-variant hover:border-outline-variant/60">+ Add</button>
          </div>

          {selectedRepo && (
            <>
              {/* Section tabs */}
              <nav className="mb-lg flex flex-wrap gap-xs" aria-label="Sections">
                {sections.map((s) => (
                  <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                    className={`flex items-center gap-xs rounded px-sm py-xs text-body-xs font-medium transition-all ${
                      activeSection === s.id ? "bg-primary text-on-primary" : "border border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60"
                    }`} aria-current={activeSection === s.id ? "page" : undefined}>
                    <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </nav>

              {activeSection === "overview" && (
                <div className="flex flex-col gap-md">
                  <div className="grid grid-cols-2 gap-sm md:grid-cols-4">
                    <div className="rounded border border-outline-variant/20 bg-surface-container-low p-sm">
                      <p className="font-mono text-[9px] text-on-surface-variant">Stars</p>
                      <p className="text-h3 font-semibold text-on-surface">{selectedRepo.stars}</p>
                    </div>
                    <div className="rounded border border-outline-variant/20 bg-surface-container-low p-sm">
                      <p className="font-mono text-[9px] text-on-surface-variant">Forks</p>
                      <p className="text-h3 font-semibold text-on-surface">{selectedRepo.forks}</p>
                    </div>
                    <div className="rounded border border-outline-variant/20 bg-surface-container-low p-sm">
                      <p className="font-mono text-[9px] text-on-surface-variant">Open Issues</p>
                      <p className="text-h3 font-semibold text-on-surface">{selectedRepo.openIssuesCount}</p>
                    </div>
                    <div className="rounded border border-outline-variant/20 bg-surface-container-low p-sm">
                      <p className="font-mono text-[9px] text-on-surface-variant">Language</p>
                      <p className="text-h3 font-semibold text-on-surface">{selectedRepo.primaryLanguage ?? "—"}</p>
                    </div>
                  </div>
                  <div className="rounded border border-outline-variant/20 bg-surface-container-low p-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Repository Details</h3>
                      <a href={`https://github.com/${selectedRepo.fullName}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] text-primary">Open in GitHub →</a>
                    </div>
                    <div className="mt-sm flex flex-col gap-[2px] font-mono text-[10px] text-on-surface-variant">
                      <span>Owner: {selectedRepo.owner}</span>
                      <span>Visibility: {selectedRepo.visibility ?? "—"}</span>
                      <span>Default Branch: {selectedRepo.defaultBranch}</span>
                      <span>License: {selectedRepo.licenseInfo ?? "—"}</span>
                      {selectedRepo.description && <span className="mt-xs">{selectedRepo.description}</span>}
                    </div>
                  </div>
                  <div className="rounded border border-outline-variant/20 bg-surface-container-low p-md">
                    <h3 className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Latest Release</h3>
                    {releases.length > 0 && releases[0] ? (
                      <div className="mt-sm font-mono text-[10px] text-on-surface-variant">
                        <a href={releases[0].htmlUrl} target="_blank" rel="noopener noreferrer" className="text-primary">{releases[0].tagName}</a>
                        <span className="ml-sm">{releases[0].publishedAt ? new Date(releases[0].publishedAt).toLocaleDateString() : ""}</span>
                      </div>
                    ) : (
                      <p className="mt-sm font-mono text-[10px] text-on-surface-variant">No releases found. Sync to load data.</p>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "issues" && (
                <div className="flex flex-col gap-xs">
                  {issues.length === 0 ? <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">No issues. Sync to load.</p> :
                    issues.map((issue) => (
                      <a key={issue.number} href={issue.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-sm transition-colors hover:bg-surface-container-high">
                        <span className={`material-symbols-outlined text-[14px] ${issue.state === "open" ? "text-[#3fb950]" : "text-on-surface-variant"}`}>{issue.state === "open" ? "error_outline" : "check_circle"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-on-surface truncate">{issue.title}</p>
                          <p className="font-mono text-[9px] text-on-surface-variant">#{issue.number} · {issue.assignee ?? "unassigned"}</p>
                        </div>
                        <div className="flex gap-[4px]">
                          {issue.labels.slice(0, 3).map((l) => (
                            <span key={l.name} className="rounded px-[4px] py-[1px] font-mono text-[8px] text-on-surface-variant" style={{ backgroundColor: `#${l.color}22`, borderColor: `#${l.color}` }}>{l.name}</span>
                          ))}
                        </div>
                      </a>
                    ))}
                </div>
              )}

              {activeSection === "pulls" && (
                <div className="flex flex-col gap-xs">
                  {pulls.length === 0 ? <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">No pull requests. Sync to load.</p> :
                    pulls.map((pr) => (
                      <a key={pr.number} href={pr.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-sm transition-colors hover:bg-surface-container-high">
                        <span className={`material-symbols-outlined text-[14px] ${pr.state === "open" ? "text-[#3fb950]" : pr.state === "closed" && pr.mergeable ? "text-[#a371f7]" : "text-error"}`}>merge</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-on-surface truncate">{pr.title}</p>
                          <p className="font-mono text-[9px] text-on-surface-variant">#{pr.number} · {pr.author ?? "unknown"} · {pr.draft ? "Draft" : pr.state}</p>
                        </div>
                        <span className={`rounded px-[4px] py-[1px] font-mono text-[8px] ${pr.draft ? "bg-surface-container-high text-on-surface-variant" : pr.state === "open" ? "bg-[#3fb950]/10 text-[#3fb950]" : "bg-surface-container-high text-on-surface-variant"}`}>{pr.draft ? "Draft" : pr.state}</span>
                      </a>
                    ))}
                </div>
              )}

              {activeSection === "commits" && (
                <div className="flex flex-col gap-xs">
                  {commits.length === 0 ? <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">No commits. Sync to load.</p> :
                    commits.map((c) => (
                      <a key={c.sha} href={c.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-sm transition-colors hover:bg-surface-container-high">
                        <code className="rounded bg-surface-container-high px-[4px] font-mono text-[9px] text-on-surface-variant">{c.sha}</code>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-on-surface truncate">{c.message}</p>
                          <p className="font-mono text-[9px] text-on-surface-variant">{c.author ?? "unknown"} · {c.date ? new Date(c.date).toLocaleDateString() : ""}</p>
                        </div>
                      </a>
                    ))}
                </div>
              )}

              {activeSection === "branches" && (
                <div className="flex flex-col gap-xs">
                  {branches.length === 0 ? <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">No branches. Sync to load.</p> :
                    branches.map((b) => (
                      <div key={b.name} className="flex items-center gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-sm">
                        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">call_split</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-on-surface truncate">{b.name}</p>
                          <p className="font-mono text-[9px] text-on-surface-variant">{b.protected ? "Protected" : "Standard"}</p>
                        </div>
                        {b.default && <span className="rounded bg-primary/10 px-[4px] py-[1px] font-mono text-[8px] text-primary">Default</span>}
                        {b.protected && <span className="material-symbols-outlined text-[12px] text-on-surface-variant">lock</span>}
                      </div>
                    ))}
                </div>
              )}

              {activeSection === "actions" && (
                <div className="flex flex-col gap-xs">
                  {workflows.length === 0 ? <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">No workflow runs. Sync to load.</p> :
                    workflows.map((w) => (
                      <a key={w.id} href={w.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-sm transition-colors hover:bg-surface-container-high">
                        <span className={`material-symbols-outlined text-[14px] ${
                          w.conclusion === "success" ? "text-[#3fb950]" : w.conclusion === "failure" ? "text-error" : w.status === "in_progress" ? "text-primary" : "text-on-surface-variant"
                        }`}>
                          {w.conclusion === "success" ? "check_circle" : w.conclusion === "failure" ? "cancel" : w.status === "in_progress" ? "hourglass_top" : "circle"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-on-surface truncate">{w.name}</p>
                          <p className="font-mono text-[9px] text-on-surface-variant">{w.branch} · {w.conclusion ?? w.status}</p>
                        </div>
                      </a>
                    ))}
                </div>
              )}

              {activeSection === "releases" && (
                <div className="flex flex-col gap-xs">
                  {releases.length === 0 ? <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">No releases. Sync to load.</p> :
                    releases.map((r) => (
                      <a key={r.tagName} href={r.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-xs rounded border border-outline-variant/20 bg-surface-container-low p-sm transition-colors hover:bg-surface-container-high">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">new_releases</span>
                            <span className="text-body-sm font-medium text-on-surface">{r.name ?? r.tagName}</span>
                          </div>
                          <span className="font-mono text-[9px] text-on-surface-variant">{new Date(r.publishedAt).toLocaleDateString()}</span>
                        </div>
                        {r.prerelease && <span className="self-start rounded bg-surface-container-high px-[4px] py-[1px] font-mono text-[8px] text-on-surface-variant">Pre-release</span>}
                        {r.body && <p className="text-body-xs text-on-surface-variant line-clamp-2">{r.body}</p>}
                      </a>
                    ))}
                </div>
              )}

              {activeSection === "repositories" && (
                <div className="flex flex-col gap-xs">
                  {repos.map((r) => (
                    <button key={r.id} type="button" onClick={() => selectRepo(r)}
                      className="flex items-center gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-sm text-left transition-colors hover:bg-surface-container-high">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">folder</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm font-medium text-on-surface">{r.fullName}</p>
                        <p className="font-mono text-[9px] text-on-surface-variant">{r.primaryLanguage ?? "—"} · {r.stars} stars · {r.openIssuesCount} issues</p>
                      </div>
                      <span className={`h-2 w-2 rounded-full ${r.visibility === "public" ? "bg-[#3fb950]" : "bg-[#d29922]"}`} title={r.visibility ?? "unknown"} />
                    </button>
                  ))}
                </div>
              )}

              {activeSection === "settings" && (
                <div className="flex flex-col gap-md max-w-md">
                  <div className="rounded border border-outline-variant/20 bg-surface-container-low p-md">
                    <h3 className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Connection</h3>
                    <div className="mt-sm font-mono text-[10px] text-on-surface-variant">
                      <p>Type: {connection.authType === "pat" ? "Personal Access Token" : "OAuth"}</p>
                      <p>Connected: {new Date(connection.connectedAt).toLocaleDateString()}</p>
                      <p>Last validated: {connection.lastValidatedAt ? new Date(connection.lastValidatedAt).toLocaleDateString() : "Never"}</p>
                    </div>
                  </div>

                  <div className="rounded border border-error/30 bg-error/5 p-md">
                    <h3 className="font-mono text-[9px] font-bold uppercase tracking-wider text-error">Danger Zone</h3>
                    <p className="mt-xs font-mono text-[10px] text-on-surface-variant">Disconnecting will remove all GitHub data from this workspace.</p>
                    <button type="button" onClick={handleDisconnect} className="mt-sm rounded bg-error px-md py-sm text-body-sm font-medium text-white transition-opacity hover:opacity-80">Disconnect</button>
                  </div>
                </div>
              )}

              {activeSection === "history" && (
                <div className="flex flex-col gap-xs">
                  {syncHistory.length === 0 ? <p className="py-md text-center font-mono text-[10px] text-on-surface-variant">No sync history.</p> :
                    syncHistory.map((h) => (
                      <div key={h.id} className="flex items-center gap-sm rounded border border-outline-variant/20 bg-surface-container-low p-sm">
                        <span className={`material-symbols-outlined text-[14px] ${h.status === "completed" ? "text-[#3fb950]" : h.status === "failed" ? "text-error" : "text-primary"}`}>
                          {h.status === "completed" ? "check_circle" : h.status === "failed" ? "cancel" : "hourglass_top"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-on-surface">{h.syncType}</p>
                          <p className="font-mono text-[9px] text-on-surface-variant">{new Date(h.startedAt).toLocaleString()} · {h.itemsProcessed} items</p>
                        </div>
                        {h.errorMessage && <p className="font-mono text-[9px] text-error max-w-[200px] truncate">{h.errorMessage}</p>}
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
