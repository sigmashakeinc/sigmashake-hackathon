import { config } from "@/services/config";

type Row = Record<string, unknown>;
type QueryError = {message: string};
type DataRow = Row & {
  id: string;
  status: string;
  file_size: number | null;
  name: string;
  enabled: boolean;
  profile_id: string;
  role: string;
  category: string;
  source_module: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  actor: string;
  owner: string;
  title: string;
  verification_status: string;
  result: string | null;
  completion_pct: number;
  vote_count: number;
  actual_hours: number | null;
  created_at: string;
  completed_date: string | null;
  checked: boolean;
  not_required: boolean;
  metadata: Record<string, unknown>;
  profiles: {display_name: string};
  submission_deliverables: {id: string; status: string}[];
};
type TableName = string;
type QueryData = DataRow | DataRow[] | null;
type QueryResult<T extends QueryData = DataRow[]> = {
  data: T;
  error: QueryError | null;
  count?: number;
};
type AuthError = QueryError;
type SelectOptions = {count?: "exact"; head?: boolean};
type Filter = {
  column: string;
  operator: "eq" | "neq" | "is" | "lt" | "lte" | "gt" | "gte" | "in" | "not";
  value: unknown;
  negatedOperator?: string;
};

const now = new Date().toISOString();
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const hackathonId = "sigma-hack-2026";
const userId = "preview-user";

const tables: Record<TableName, Row[]> = {
  hackathons: [
    {
      id: hackathonId,
      name: "SigmaShake Hackathon",
      slug: "sigmashake-hackathon",
      organizer: "SigmaShake",
      location: "Remote",
      start_date: now,
      end_date: nextWeek,
      submission_deadline: nextWeek,
      timezone: "America/Los_Angeles",
      website: "https://hack.sigmashake.com",
      devpost_url: null,
      description:
        "AI-native hackathon workspace for coding agents and human reviewers.",
      status: "active",
      tracks: "Cloudflare Workers, Go backends, Next.js collaboration",
      prizes: "Production readiness, agent collaboration, live demos",
      created_at: now,
      updated_at: now,
    },
  ],
  profiles: [
    {
      id: userId,
      user_id: userId,
      email: "agent@sigmashake.com",
      username: "sigmashake-agent",
      display_name: "SigmaShake Agent",
      avatar_url: null,
      bio: "Preview identity backed by accounts.sigmashake.com.",
      role: "owner",
      created_at: now,
      updated_at: now,
    },
  ],
  team_members: [
    {
      id: "team-owner",
      hackathon_id: hackathonId,
      user_id: userId,
      role: "owner",
      status: "active",
      profiles: {
        id: userId,
        display_name: "SigmaShake Agent",
        username: "sigmashake-agent",
        avatar_url: null,
      },
      joined_at: now,
    },
    {
      id: "team-build",
      hackathon_id: hackathonId,
      user_id: "agent-build",
      role: "lead",
      status: "active",
      profiles: {
        id: "agent-build",
        display_name: "Build Agent",
        username: "build-agent",
        avatar_url: null,
      },
      joined_at: now,
    },
  ],
  objectives: [
    {
      id: "objective-cloudflare",
      hackathon_id: hackathonId,
      title: "Ship Cloudflare-native stack",
      status: "in_progress",
      sort_order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: "objective-parity",
      hackathon_id: hackathonId,
      title: "Restore SSG-Hackathon frontend parity",
      status: "completed",
      sort_order: 2,
      created_at: now,
      updated_at: now,
    },
  ],
  milestones: [
    {
      id: "milestone-live",
      hackathon_id: hackathonId,
      name: "Live worker preview",
      status: "in_progress",
      due_date: tomorrow,
      sort_order: 1,
    },
  ],
  deliverables: [
    {
      id: "deliverable-web",
      hackathon_id: hackathonId,
      title: "Next.js frontend on Cloudflare",
      status: "complete",
      sort_order: 1,
    },
    {
      id: "deliverable-go",
      hackathon_id: hackathonId,
      title: "Go API adapter contract",
      status: "in_progress",
      sort_order: 2,
    },
  ],
  requirements: [
    {
      id: "requirement-accounts",
      hackathon_id: hackathonId,
      title: "Authentication uses accounts.sigmashake.com",
      status: "completed",
      sort_order: 1,
    },
  ],
  risks: [
    {
      id: "risk-data",
      hackathon_id: hackathonId,
      title: "Supabase data paths must move to Cloudflare D1/R2",
      status: "identified",
      impact: "high",
      likelihood: "medium",
      sort_order: 1,
    },
  ],
  decisions: [
    {
      id: "decision-facade",
      hackathon_id: hackathonId,
      title: "Keep frontend contracts and replace backend adapters",
      status: "accepted",
      sort_order: 1,
    },
  ],
  planning_notes: [
    {
      id: "planning-note",
      hackathon_id: hackathonId,
      title: "Collaboration model",
      content: "Every agent works from the same git-backed filesystem state.",
      sort_order: 1,
    },
  ],
  ideas: [
    {
      id: "idea-agent-state",
      hackathon_id: hackathonId,
      title: "Shared agent workspace state",
      summary: "Use git plus deterministic Docker entrypoints for all agents.",
      status: "approved",
      priority: "high",
      votes: 6,
      category: "platform",
      created_at: now,
      updated_at: now,
    },
  ],
  idea_votes: [
    {
      id: "idea-vote",
      idea_id: "idea-agent-state",
      user_id: userId,
      created_at: now,
    },
  ],
  research_items: [
    {
      id: "research-opennext",
      hackathon_id: hackathonId,
      title: "OpenNext Cloudflare deployment path",
      summary: "Build and deploy Next.js through OpenNext for Workers.",
      url: "https://opennext.js.org/cloudflare",
      source_type: "documentation",
      category: "platform",
      verified: true,
      verification_status: "verified",
      created_at: now,
      updated_at: now,
    },
  ],
  tasks: [
    {
      id: "task-port-ui",
      hackathon_id: hackathonId,
      title: "Port upstream frontend routes",
      status: "done",
      priority: "high",
      owner: "sigmashake-agent",
      assignees: ["sigmashake-agent"],
      due_date: tomorrow,
      actual_hours: 4,
      completed_date: now,
      created_at: now,
      updated_at: now,
      task_checklist_items: [
        {id: "task-port-ui-1", task_id: "task-port-ui", label: "Copy routes", checked: true},
        {id: "task-port-ui-2", task_id: "task-port-ui", label: "Patch adapters", checked: true},
      ],
    },
    {
      id: "task-wire-d1",
      hackathon_id: hackathonId,
      title: "Replace preview facade with D1-backed API",
      status: "in_progress",
      priority: "high",
      owner: "build-agent",
      assignees: ["build-agent"],
      due_date: nextWeek,
      actual_hours: null,
      completed_date: null,
      created_at: now,
      updated_at: now,
      task_checklist_items: [],
    },
  ],
  task_checklist_items: [],
  submissions: [
    {
      id: "submission-main",
      hackathon_id: hackathonId,
      title: "SigmaShake Hackathon Platform",
      status: "draft",
      locked: false,
      created_at: now,
      updated_at: now,
    },
  ],
  submission_deliverables: [
    {
      id: "sub-deliverable-web",
      submission_id: "submission-main",
      title: "Live frontend",
      status: "complete",
    },
    {
      id: "sub-deliverable-api",
      submission_id: "submission-main",
      title: "Cloudflare data API",
      status: "incomplete",
    },
  ],
  submission_checklist: [
    {
      id: "sub-check-live",
      submission_id: "submission-main",
      label: "Live URL responds",
      checked: true,
      not_required: false,
    },
    {
      id: "sub-check-auth",
      submission_id: "submission-main",
      label: "Accounts login connected",
      checked: true,
      not_required: false,
    },
  ],
  notes: [
    {
      id: "note-standup",
      hackathon_id: hackathonId,
      title: "Implementation notes",
      content: "Frontend parity is restored first; D1 persistence follows.",
      category: "standup",
      pinned: true,
      archived: false,
      word_count: 8,
      created_at: now,
      updated_at: now,
    },
  ],
  files: [
    {
      id: "file-architecture",
      hackathon_id: hackathonId,
      folder_id: null,
      name: "architecture.md",
      original_name: "architecture.md",
      category: "markdown",
      mime_type: "text/markdown",
      file_size: 4096,
      storage_path: "preview/architecture.md",
      pinned: true,
      archived: false,
      favourite: true,
      version: 1,
      created_at: now,
      updated_at: now,
    },
  ],
  folders: [],
  activity_events: [
    {
      id: "activity-port",
      hackathon_id: hackathonId,
      module: "frontend",
      action: "ported",
      actor: "sigmashake-agent",
      message: "Restored SSG-Hackathon route surface",
      severity: "info",
      created_at: now,
    },
  ],
  integration_connections: [
    {
      id: "integration-github",
      hackathon_id: hackathonId,
      provider: "github",
      name: "GitHub",
      status: "connected",
      created_at: now,
      updated_at: now,
    },
  ],
  integration_health: [],
  integration_logs: [],
  integration_validations: [],
  automation_rules: [
    {
      id: "automation-ci",
      hackathon_id: hackathonId,
      name: "CI release workflow",
      enabled: true,
      trigger: "push",
      action: "deploy-worker",
      created_at: now,
      updated_at: now,
    },
  ],
  automation_runs: [
    {
      id: "automation-run-live",
      rule_id: "automation-ci",
      hackathon_id: hackathonId,
      status: "completed",
      started_at: now,
      completed_at: now,
    },
  ],
  automation_templates: [],
  comments: [],
  comment_threads: [],
  mentions: [],
  notifications: [
    {
      id: "notification-live",
      user_id: userId,
      title: "Frontend port in progress",
      body: "The upstream feature surface is now present in the Cloudflare app.",
      read: false,
      archived: false,
      created_at: now,
    },
  ],
  notification_preferences: [
    {
      id: "notification-pref",
      user_id: userId,
      preferences: {},
    },
  ],
  invitations: [
    {
      id: "invite-preview",
      code: "SIGMA-PREVIEW",
      email: "agent@sigmashake.com",
      role: "owner",
      status: "pending",
      hackathon_id: hackathonId,
      expires_at: nextWeek,
      created_at: now,
    },
  ],
  relationships: [],
  reviews: [],
  review_requests: [],
  workspace_archive: [],
  archive_workspaces: [],
  lessons_learned: [],
  retrospectives: [],
  report_exports: [],
  analytics_snapshots: [],
  github_connections: [],
  github_repositories: [],
  github_sync_history: [],
  hackathon_events: [
    {
      id: "event-sigma",
      slug: "sigmashake-hackathon",
      name: "SigmaShake Hackathon",
      organizer: "SigmaShake",
      event_type: "online",
      featured: true,
      status: "registration_open",
      start_date: now,
      end_date: nextWeek,
      location: "Remote",
      url: "https://hack.sigmashake.com",
    },
  ],
  event_pipeline: [],
  workspace_templates: [
    {
      id: "template-agent-native",
      name: "AI-native Cloudflare workspace",
      category: "platform",
      featured: true,
      description: "Next.js frontend, Go service contracts, and Workers deploys.",
    },
  ],
  platform_config: [
    {
      id: "platform",
      platform_name: "SigmaShake Hackathon",
      initialised: true,
      created_at: now,
    },
  ],
  admin_logs: [],
  users: [],
  attachments: [],
  checklist_items: [],
  checklist_templates: [],
};

function rowsFor(table: TableName): Row[] {
  if (!tables[table]) tables[table] = [];
  return tables[table]!;
}

function normalizeRows(input: unknown): Row[] {
  if (Array.isArray(input)) return input.map((item) => normalizeRow(item));
  return [normalizeRow(input)];
}

function normalizeRow(input: unknown): Row {
  if (input && typeof input === "object") return input as Row;
  return {};
}

function normalizeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function toDataRow(row: Row | undefined): DataRow {
  return {
    id: String(row?.id ?? normalizeId("row")),
    status: String(row?.status ?? ""),
    file_size: typeof row?.file_size === "number" ? row.file_size : null,
    name: String(row?.name ?? row?.title ?? ""),
    enabled: Boolean(row?.enabled),
    profile_id: String(row?.profile_id ?? row?.user_id ?? ""),
    role: String(row?.role ?? ""),
    category: String(row?.category ?? ""),
    source_module: String(row?.source_module ?? ""),
    source_id: String(row?.source_id ?? ""),
    target_id: String(row?.target_id ?? ""),
    relationship_type: String(row?.relationship_type ?? ""),
    actor: String(row?.actor ?? ""),
    owner: String(row?.owner ?? ""),
    title: String(row?.title ?? row?.name ?? ""),
    verification_status: String(row?.verification_status ?? ""),
    result: typeof row?.result === "string" ? row.result : null,
    completion_pct: typeof row?.completion_pct === "number" ? row.completion_pct : 0,
    vote_count: typeof row?.vote_count === "number" ? row.vote_count : Number(row?.votes ?? 0),
    actual_hours: typeof row?.actual_hours === "number" ? row.actual_hours : null,
    created_at: String(row?.created_at ?? now),
    completed_date: typeof row?.completed_date === "string" ? row.completed_date : null,
    checked: Boolean(row?.checked),
    not_required: Boolean(row?.not_required),
    metadata:
      row?.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    profiles:
      row?.profiles && typeof row.profiles === "object"
        ? (row.profiles as {display_name: string})
        : {display_name: ""},
    submission_deliverables: Array.isArray(row?.submission_deliverables)
      ? (row.submission_deliverables as {id: string; status: string}[])
      : [],
    ...(row ?? {}),
  };
}

function matchesFilter(row: Row, filter: Filter): boolean {
  const actual = row[filter.column];
  if (filter.operator === "eq") return actual === filter.value;
  if (filter.operator === "neq") return actual !== filter.value;
  if (filter.operator === "is") return actual === filter.value;
  if (filter.operator === "in") {
    return Array.isArray(filter.value) && filter.value.includes(actual);
  }
  if (filter.operator === "lt") return String(actual ?? "") < String(filter.value ?? "");
  if (filter.operator === "lte") return String(actual ?? "") <= String(filter.value ?? "");
  if (filter.operator === "gt") return String(actual ?? "") > String(filter.value ?? "");
  if (filter.operator === "gte") return String(actual ?? "") >= String(filter.value ?? "");
  if (filter.operator === "not") {
    if (filter.negatedOperator === "eq") return actual !== filter.value;
    if (filter.negatedOperator === "is") return actual !== filter.value;
    if (filter.negatedOperator === "in" && typeof filter.value === "string") {
      return !filter.value.includes(String(actual ?? ""));
    }
    return true;
  }
  return true;
}

class LocalQuery {
  private filters: Filter[] = [];
  private limitCount: number | null = null;
  private countRequested = false;
  private headRequested = false;
  private mutation:
    | {kind: "insert" | "upsert"; rows: Row[]}
    | {kind: "update"; patch: Row}
    | {kind: "delete"}
    | null = null;

  constructor(private readonly table: TableName) {}

  select(_columns = "*", options?: SelectOptions): this {
    this.countRequested = options?.count === "exact";
    this.headRequested = options?.head === true;
    return this;
  }

  insert(input: unknown): this {
    this.mutation = {kind: "insert", rows: normalizeRows(input)};
    return this;
  }

  upsert(input: unknown, _options?: unknown): this {
    this.mutation = {kind: "upsert", rows: normalizeRows(input)};
    return this;
  }

  update(input: unknown): this {
    this.mutation = {kind: "update", patch: normalizeRow(input)};
    return this;
  }

  delete(): this {
    this.mutation = {kind: "delete"};
    return this;
  }

  eq(column: string, value: unknown): this {
    this.filters.push({column, operator: "eq", value});
    return this;
  }

  neq(column: string, value: unknown): this {
    this.filters.push({column, operator: "neq", value});
    return this;
  }

  is(column: string, value: unknown): this {
    this.filters.push({column, operator: "is", value});
    return this;
  }

  not(column: string, operator: string, value: unknown): this {
    this.filters.push({column, operator: "not", value, negatedOperator: operator});
    return this;
  }

  in(column: string, value: unknown[]): this {
    this.filters.push({column, operator: "in", value});
    return this;
  }

  lt(column: string, value: unknown): this {
    this.filters.push({column, operator: "lt", value});
    return this;
  }

  lte(column: string, value: unknown): this {
    this.filters.push({column, operator: "lte", value});
    return this;
  }

  gt(column: string, value: unknown): this {
    this.filters.push({column, operator: "gt", value});
    return this;
  }

  gte(column: string, value: unknown): this {
    this.filters.push({column, operator: "gte", value});
    return this;
  }

  or(_expression: string): this {
    return this;
  }

  order(_column: string, _options?: unknown): this {
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  range(_from: number, to: number): this {
    this.limitCount = to + 1;
    return this;
  }

  filter(column: string, operator: string, value: unknown): this {
    if (operator === "eq") return this.eq(column, value);
    if (operator === "neq") return this.neq(column, value);
    return this;
  }

  async maybeSingle(): Promise<QueryResult<DataRow | null>> {
    const result = await this.executeRows();
    return {
      data: result.rows[0] ? toDataRow(result.rows[0]) : null,
      error: null,
      count: result.count,
    };
  }

  async single(): Promise<QueryResult<DataRow>> {
    const result = await this.executeRows();
    return {
      data: toDataRow(result.rows[0] ?? {id: normalizeId(this.table), created_at: now, updated_at: now}),
      error: null,
      count: result.count,
    };
  }

  then<TResult1 = QueryResult<DataRow[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult<DataRow[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<QueryResult<DataRow[]>> {
    const result = await this.executeRows();
    return {
      data: this.headRequested ? [] : result.rows.map(toDataRow),
      error: null,
      count: this.countRequested ? result.count : undefined,
    };
  }

  private async executeRows(): Promise<{rows: Row[]; count: number}> {
    const tableRows = rowsFor(this.table);
    if (this.mutation?.kind === "insert" || this.mutation?.kind === "upsert") {
      const inserted = this.mutation.rows.map((row) => ({
        id: row.id ?? normalizeId(this.table),
        created_at: row.created_at ?? now,
        updated_at: now,
        ...row,
      }));
      tableRows.unshift(...inserted);
      return {rows: inserted, count: inserted.length};
    }

    let rows = tableRows.filter((row) =>
      this.filters.every((filter) => matchesFilter(row, filter)),
    );

    if (this.mutation?.kind === "update") {
      rows = rows.map((row) => Object.assign(row, this.mutation && "patch" in this.mutation ? this.mutation.patch : {}, {updated_at: now}));
    }

    if (this.mutation?.kind === "delete") {
      for (const row of rows) {
        const index = tableRows.indexOf(row);
        if (index >= 0) tableRows.splice(index, 1);
      }
      rows = [];
    }

    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
    return {rows, count: rows.length};
  }
}

class LocalStorageBucket {
  constructor(private readonly bucket: string) {}

  async upload(path: string, _file: File, _options?: unknown) {
    return {data: {path}, error: null};
  }

  async remove(paths: string[]) {
    return {data: paths.map((path) => ({name: path})), error: null};
  }

  getPublicUrl(path: string) {
    const base = config.cloudflare.storage || "https://hack.sigmashake.com/assets";
    return {
      data: {
        publicUrl: `${base.replace(/\/$/, "")}/${this.bucket}/${path}`,
      },
    };
  }
}

class LocalStorageClient {
  from(bucket: string) {
    return new LocalStorageBucket(bucket);
  }

  async listBuckets() {
    return {
      data: [
        {id: "attachments", name: "attachments"},
        {id: "submissions", name: "submissions"},
        {id: "exports", name: "exports"},
      ],
      error: null,
    };
  }
}

class LocalAuthClient {
  readonly admin = {
    deleteUser: async (_id: string): Promise<{data: object; error: AuthError | null}> => ({
      data: {},
      error: null,
    }),
  };

  async getSession() {
    return {
      data: {
        session: {
          access_token: "preview-session",
          provider_token: null,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user: {
            id: userId,
            email: "agent@sigmashake.com",
            user_metadata: {user_name: "sigmashake-agent"},
          },
        },
      },
      error: null,
    };
  }

  async signInWithPassword(_params: {email?: string; password?: string}) {
    return this.getSession();
  }

  async signUp(_params: {
    email: string;
    password: string;
    options?: {data?: Row};
  }): Promise<{data: {user: {id: string}}; error: AuthError | null}> {
    return {data: {user: {id: userId}}, error: null};
  }

  async signInWithOAuth(_params: {provider: string; options?: {redirectTo?: string}}): Promise<{data: null; error: AuthError | null}> {
    if (typeof window !== "undefined") {
      window.location.href = buildAccountsUrl("/oauth/authorize");
    }
    return {data: null, error: null};
  }

  async resetPasswordForEmail(_email: string, _options?: {redirectTo?: string}): Promise<{data: object; error: AuthError | null}> {
    return {data: {}, error: null};
  }

  async updateUser(_params: {password?: string}): Promise<{data: object; error: AuthError | null}> {
    return {data: {}, error: null};
  }
}

class LocalCloudflareClient {
  readonly auth = new LocalAuthClient();
  readonly storage = new LocalStorageClient();

  from(table: TableName) {
    return new LocalQuery(table);
  }

  async rpc(name: string, params?: Row) {
    if (name === "is_platform_initialised") return {data: true, error: null};
    if (name === "activate_hackathon" && params?.hackathon_id) {
      for (const row of rowsFor("hackathons")) {
        row.status = row.id === params.hackathon_id ? "active" : "draft";
      }
    }
    if (name === "increment_idea_votes" && params?.idea_id) {
      const idea = rowsFor("ideas").find((row) => row.id === params.idea_id);
      if (idea) idea.votes = Number(idea.votes ?? 0) + 1;
    }
    if (name === "decrement_idea_votes" && params?.idea_id) {
      const idea = rowsFor("ideas").find((row) => row.id === params.idea_id);
      if (idea) idea.votes = Math.max(0, Number(idea.votes ?? 0) - 1);
    }
    return {data: null, error: null};
  }
}

let client: LocalCloudflareClient | null = null;

export function buildAccountsUrl(path = "/oauth/authorize"): string {
  const base = config.accounts.url.replace(/\/$/, "");
  const url = new URL(path, `${base}/`);
  url.searchParams.set("client_id", config.accounts.clientId);
  url.searchParams.set("redirect_uri", `${config.app.url}/login`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  return url.toString();
}

export function getSupabaseBrowserClient() {
  client ??= new LocalCloudflareClient();
  return client;
}

export function getSupabaseServerClient() {
  client ??= new LocalCloudflareClient();
  return client;
}

export async function checkSupabaseHealth() {
  return {
    healthy: true,
    error: undefined,
    provider: "cloudflare-local-preview",
  };
}
