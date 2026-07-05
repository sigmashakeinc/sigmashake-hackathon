export const BUCKETS = {
  AVATARS: "avatars",
  ATTACHMENTS: "attachments",
  RESOURCES: "resources",
  SUBMISSIONS: "submissions",
  EXPORTS: "exports",
  TEMPORARY: "temporary",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export const bucketConfig: Record<
  BucketName,
  { public: boolean; maxSize: number; description: string }
> = {
  avatars: {
    public: true,
    maxSize: 2 * 1024 * 1024,
    description: "User profile pictures",
  },
  attachments: {
    public: false,
    maxSize: 10 * 1024 * 1024,
    description: "Task and project attachments",
  },
  resources: {
    public: false,
    maxSize: 50 * 1024 * 1024,
    description: "Shared team resources",
  },
  submissions: {
    public: false,
    maxSize: 100 * 1024 * 1024,
    description: "Hackathon project submissions",
  },
  exports: {
    public: false,
    maxSize: 100 * 1024 * 1024,
    description: "Data exports",
  },
  temporary: {
    public: false,
    maxSize: 10 * 1024 * 1024,
    description: "Temporary uploads (auto-cleaned)",
  },
};
