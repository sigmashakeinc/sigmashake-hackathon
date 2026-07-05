export type Permission =
  | "workspace:view"
  | "workspace:manage"
  | "workspace:archive"
  | "workspace:view-members"
  | "members:invite"
  | "members:remove"
  | "members:manage"
  | "planning:view"
  | "planning:manage"
  | "ideas:view"
  | "ideas:create"
  | "ideas:vote"
  | "ideas:edit"
  | "ideas:delete"
  | "ideas:manage"
  | "tasks:view"
  | "tasks:create"
  | "tasks:assign"
  | "tasks:edit"
  | "tasks:delete"
  | "tasks:manage"
  | "research:view"
  | "research:create"
  | "research:edit"
  | "research:delete"
  | "research:manage"
  | "files:view"
  | "files:upload"
  | "files:delete"
  | "files:manage"
  | "submissions:view"
  | "submissions:create"
  | "submissions:edit"
  | "submissions:delete"
  | "submissions:manage"
  | "judging:view"
  | "judging:score";

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: Permission[];
  isDefault?: boolean;
}
