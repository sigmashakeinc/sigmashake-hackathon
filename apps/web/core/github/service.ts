import { getSupabaseServerClient } from "@/services/supabase";
import type {
  GitHubConnection, GitHubRepository, GitHubIssue, GitHubPR,
  GitHubCommit, GitHubBranch, GitHubWorkflow, GitHubRelease,
  ValidationResult, AuthType,
} from "./types";

export function createGitHubService() {
  function client() {
    return getSupabaseServerClient();
  }

  function ghApi(token: string) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "SSG-Hackathon",
    };

    return {
      async get<T>(path: string): Promise<T> {
        const res = await fetch(`https://api.github.com${path}`, { headers });
        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        }
        return res.json() as Promise<T>;
      },
    };
  }

  async function saveConnection(hackathonId: string, authType: AuthType, token: string, userId: string): Promise<GitHubConnection> {
    let encryptedToken = "";
    if (authType === "pat" && token) {
      const result = await (client().rpc("encrypt_token" as never, { plaintext: token } as never) as unknown as Promise<{ data: string }>);
      if (!result.data) throw new Error("Failed to encrypt PAT token");
      encryptedToken = result.data;
    }

    const { data } = await client()
      .from("github_connections")
      .insert({
        hackathon_id: hackathonId,
        auth_type: authType,
        access_token: "",
        encrypted_token: encryptedToken || null,
        created_by: userId,
      } as never)
      .select()
      .single() as never;

    return data as unknown as GitHubConnection;
  }

  async function getConnection(hackathonId: string): Promise<GitHubConnection | null> {
    const { data } = await client()
      .from("github_connections")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .maybeSingle();

    return data ? mapConnectionRow(data as Record<string, unknown>) : null;
  }

  async function getConnectionToken(hackathonId: string): Promise<string | null> {
    const conn = await getConnection(hackathonId);
    if (!conn) return null;
    if (conn.authType === "pat") {
      if (conn.accessToken) return conn.accessToken; // plaintext fallback
      if (conn.encryptedToken) {
        try {
          const result = await (client().rpc("decrypt_token" as never, { ciphertext: conn.encryptedToken } as never) as unknown as Promise<{ data: string }>);
          return result.data ?? null;
        } catch { return null; }
      }
    }
    return null; // OAuth tokens come from session, not DB
  }

  async function deleteConnection(id: string): Promise<void> {
    await client().from("github_connections").delete().eq("id", id) as never;
  }

  async function saveOAuthConnection(hackathonId: string, tokenOwner: string, scopes: string, userId: string): Promise<GitHubConnection> {
    const { data } = await client()
      .from("github_connections")
      .insert({
        hackathon_id: hackathonId,
        auth_type: "oauth",
        access_token: "", // OAuth tokens come from session, not stored
        token_owner: tokenOwner,
        scopes,
        created_by: userId,
      } as never)
      .select()
      .single() as never;

    return data as unknown as GitHubConnection;
  }

  async function getRepositories(hackathonId: string): Promise<GitHubRepository[]> {
    const { data } = await client()
      .from("github_repositories")
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("is_active", true)
      .order("stars", { ascending: false });

    return ((data ?? []) as Record<string, unknown>[]).map(mapRepoRow);
  }

  async function saveRepository(connId: string, hackathonId: string, repo: Record<string, unknown>): Promise<void> {
    const [owner, name] = (repo.full_name as string).split("/");
    await client()
      .from("github_repositories")
      .upsert({
        connection_id: connId,
        hackathon_id: hackathonId,
        full_name: repo.full_name,
        owner,
        name,
        description: repo.description ?? null,
        visibility: repo.visibility ?? null,
        default_branch: repo.default_branch ?? "main",
        primary_language: repo.language ?? null,
        license_info: (repo.license as Record<string, string>)?.spdx_id ?? null,
        fork: repo.fork ?? false,
        stars: repo.stargazers_count ?? 0,
        forks: repo.forks_count ?? 0,
        open_issues_count: repo.open_issues_count ?? 0,
        topics: repo.topics ?? [],
        homepage: repo.homepage ?? null,
        archived: repo.archived ?? false,
        disabled: repo.disabled ?? false,
      } as never) as never;
  }

  async function validateToken(token: string): Promise<ValidationResult> {
    try {
      const api = ghApi(token);
      const user = await api.get<{ login: string }>("/user");
      const resp = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "SSG-Hackathon" },
      });
      const scopes = (resp.headers.get("X-OAuth-Scopes") ?? "").split(", ").filter(Boolean);
      return { valid: true, owner: user.login, repository: null, scopes, errors: [] };
    } catch (e) {
      return { valid: false, owner: null, repository: null, scopes: [], errors: [(e as Error).message] };
    }
  }

  async function fetchUserRepos(token: string): Promise<{ full_name: string; owner: string }[]> {
    const api = ghApi(token);
    const repos = await api.get<{ full_name: string; owner: { login: string } }[]>("/user/repos?per_page=100&sort=updated");
    return repos.map((r) => ({ full_name: r.full_name, owner: r.owner.login }));
  }

  function fetchRepoData(token: string, owner: string, repo: string): Promise<Record<string, unknown>> {
    const api = ghApi(token);
    return api.get<Record<string, unknown>>(`/repos/${owner}/${repo}`);
  }

  async function fetchIssues(token: string, owner: string, repo: string): Promise<GitHubIssue[]> {
    const api = ghApi(token);
    const items = await api.get<Record<string, unknown>[]>(`/repos/${owner}/${repo}/issues?per_page=20&state=all&sort=updated`);
    return items
      .filter((i) => !(i.html_url as string).includes("/pull/"))
      .map((i) => ({
        number: i.number as number,
        title: i.title as string,
        state: i.state as string,
        labels: ((i.labels ?? []) as { name: string; color: string }[]).map((l) => ({ name: l.name, color: l.color })),
        milestone: (i.milestone as Record<string, string>)?.title ?? null,
        assignee: (i.assignee as Record<string, string>)?.login ?? null,
        createdAt: i.created_at as string,
        updatedAt: i.updated_at as string,
        htmlUrl: i.html_url as string,
      }));
  }

  async function fetchPRs(token: string, owner: string, repo: string): Promise<GitHubPR[]> {
    const api = ghApi(token);
    const items = await api.get<Record<string, unknown>[]>(`/repos/${owner}/${repo}/pulls?per_page=20&state=all&sort=updated`);
    return items.map((pr) => ({
      number: pr.number as number,
      title: pr.title as string,
      state: pr.state as string,
      draft: pr.draft as boolean,
      author: (pr.user as Record<string, string>)?.login ?? null,
      reviewStatus: (pr.mergeable as boolean) === true ? "mergeable" : pr.draft ? "draft" : "needs_review",
      mergeable: pr.mergeable as boolean | null,
      createdAt: pr.created_at as string,
      updatedAt: pr.updated_at as string,
      htmlUrl: pr.html_url as string,
    }));
  }

  async function fetchCommits(token: string, owner: string, repo: string): Promise<GitHubCommit[]> {
    const api = ghApi(token);
    const items = await api.get<Record<string, unknown>[]>(`/repos/${owner}/${repo}/commits?per_page=15`);
    return items.map((c) => ({
      sha: (c.sha as string).slice(0, 7),
      message: ((c.commit as Record<string, unknown>).message as string)?.split("\n")[0] ?? "",
      author: ((c.commit as Record<string, unknown>).author as Record<string, string>)?.name ?? null,
      date: ((c.commit as Record<string, unknown>).author as Record<string, string>)?.date ?? "",
      htmlUrl: c.html_url as string,
    }));
  }

  async function fetchBranches(token: string, owner: string, repo: string): Promise<GitHubBranch[]> {
    const api = ghApi(token);
    const [items, repoData] = await Promise.all([
      api.get<Record<string, unknown>[]>(`/repos/${owner}/${repo}/branches?per_page=20`),
      fetchRepoData(token, owner, repo),
    ]);
    const defaultBranch = (repoData.default_branch as string) ?? "main";
    return items.map((b) => ({
      name: b.name as string,
      protected: b.protected as boolean,
      default: b.name === defaultBranch,
      lastCommitSha: ((b.commit as Record<string, unknown>).sha as string).slice(0, 7),
      lastCommitDate: "",
    }));
  }

  async function fetchWorkflows(token: string, owner: string, repo: string): Promise<GitHubWorkflow[]> {
    const api = ghApi(token);
    const data = await api.get<{ workflow_runs: Record<string, unknown>[] }>(`/repos/${owner}/${repo}/actions/runs?per_page=10`);
    return (data.workflow_runs ?? []).map((w) => ({
      id: w.id as number,
      name: w.name as string,
      status: w.status as string,
      conclusion: w.conclusion as string | null,
      branch: (w.head_branch as string) ?? "main",
      createdAt: w.created_at as string,
      updatedAt: w.updated_at as string,
      htmlUrl: w.html_url as string,
    }));
  }

  async function fetchReleases(token: string, owner: string, repo: string): Promise<GitHubRelease[]> {
    const api = ghApi(token);
    const items = await api.get<Record<string, unknown>[]>(`/repos/${owner}/${repo}/releases?per_page=10`);
    return items.map((r) => ({
      tagName: r.tag_name as string,
      name: r.name as string | null,
      prerelease: r.prerelease as boolean,
      publishedAt: r.published_at as string,
      body: r.body as string | null,
      htmlUrl: r.html_url as string,
    }));
  }

  async function recordSync(connectionId: string, syncType: string, status: "running" | "completed" | "failed", itemsProcessed = 0, errorMessage?: string): Promise<void> {
    await client()
      .from("github_sync_history")
      .insert({
        connection_id: connectionId,
        sync_type: syncType,
        status,
        items_processed: itemsProcessed,
        error_message: errorMessage ?? null,
        completed_at: status !== "running" ? new Date().toISOString() : null,
      } as never) as never;
  }

  async function getSyncHistory(connectionId: string): Promise<{ id: string; connectionId: string; repositoryId: string | null; syncType: string; status: string; itemsProcessed: number; errorMessage: string | null; startedAt: string; completedAt: string | null }[]> {
    const { data } = await client()
      .from("github_sync_history")
      .select("*")
      .eq("connection_id", connectionId)
      .order("started_at", { ascending: false })
      .limit(20);

    return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
      id: r.id as string,
      connectionId: r.connection_id as string,
      repositoryId: r.repository_id as string | null,
      syncType: r.sync_type as string,
      status: r.status as string,
      itemsProcessed: (r.items_processed as number) ?? 0,
      errorMessage: r.error_message as string | null,
      startedAt: r.started_at as string,
      completedAt: r.completed_at as string | null,
    }));
  }

  return {
    saveConnection, saveOAuthConnection, getConnection, getConnectionToken, deleteConnection,
    getRepositories, saveRepository,
    validateToken, fetchUserRepos, fetchRepoData,
    fetchIssues, fetchPRs, fetchCommits, fetchBranches, fetchWorkflows, fetchReleases,
    recordSync, getSyncHistory,
  };
}

function mapConnectionRow(row: Record<string, unknown>): GitHubConnection {
  return {
    id: row.id as string,
    hackathonId: row.hackathon_id as string,
    authType: row.auth_type as AuthType,
    accessToken: row.access_token as string,
    encryptedToken: row.encrypted_token as string | null,
    tokenOwner: row.token_owner as string | null,
    scopes: row.scopes as string | null,
    connectedAt: row.connected_at as string,
    lastValidatedAt: row.last_validated_at as string | null,
    createdBy: row.created_by as string,
  };
}

function mapRepoRow(row: Record<string, unknown>): GitHubRepository {
  return {
    id: row.id as string,
    connectionId: row.connection_id as string,
    hackathonId: row.hackathon_id as string,
    fullName: row.full_name as string,
    owner: row.owner as string,
    name: row.name as string,
    description: row.description as string | null,
    visibility: row.visibility as string | null,
    defaultBranch: (row.default_branch as string) ?? "main",
    primaryLanguage: row.primary_language as string | null,
    licenseInfo: row.license_info as string | null,
    fork: (row.fork as boolean) ?? false,
    stars: (row.stars as number) ?? 0,
    forks: (row.forks as number) ?? 0,
    openIssuesCount: (row.open_issues_count as number) ?? 0,
    latestReleaseTag: row.latest_release_tag as string | null,
    latestReleaseUrl: row.latest_release_url as string | null,
    topics: (row.topics as string[]) ?? [],
    homepage: row.homepage as string | null,
    archived: (row.archived as boolean) ?? false,
    disabled: (row.disabled as boolean) ?? false,
    isActive: (row.is_active as boolean) ?? true,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    lastSyncedAt: row.last_synced_at as string | null,
    createdAt: row.created_at as string,
  };
}
