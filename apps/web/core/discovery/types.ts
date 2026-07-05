export type EventType = "online" | "in_person" | "hybrid";
export type EventStatus = "upcoming" | "registration_open" | "registration_closed" | "active" | "judging" | "completed" | "cancelled";
export type PipelineStatus = "discovered" | "watching" | "interested" | "applied" | "accepted" | "rejected" | "withdrawn" | "workspace_created" | "active" | "submitted" | "judging" | "completed" | "archived";
export type Difficulty = "beginner" | "intermediate" | "advanced" | "all";

export interface HackathonEvent {
  id: string;
  name: string;
  slug: string;
  organizer: string;
  description: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  registrationUrl: string | null;
  location: string | null;
  country: string | null;
  eventType: EventType;
  difficulty: Difficulty;
  prizePool: string | null;
  maxTeamSize: number | null;
  minTeamSize: number;
  timezone: string;
  startDate: string | null;
  endDate: string | null;
  registrationOpen: string | null;
  registrationClose: string | null;
  submissionDeadline: string | null;
  tracks: string[] | null;
  technologies: string[] | null;
  rules: string | null;
  eligibility: string | null;
  judgingCriteria: string | null;
  sponsors: string | null;
  faq: Record<string, string>[] | null;
  resources: string | null;
  status: EventStatus;
  featured: boolean;
  tags: string[] | null;
  ownerNotes: string | null;
  createdAt: string;
  updatedAt: string;
  pipelineStatus?: PipelineStatus | null;
}

export interface EventPipeline {
  id: string;
  eventId: string;
  userId: string | null;
  status: PipelineStatus;
  applicationUrl: string | null;
  confirmationNumber: string | null;
  decisionDate: string | null;
  applicationDate: string | null;
  ownerNotes: string | null;
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  online: "Online", in_person: "In Person", hybrid: "Hybrid",
};

export const STATUS_COLORS: Record<string, string> = {
  upcoming: "text-on-surface-variant border-surface-variant",
  registration_open: "text-[#3fb950] border-[#3fb950]/30",
  registration_closed: "text-[#d29922] border-[#d29922]/30",
  active: "text-primary border-primary/30",
  judging: "text-[#d29922] border-[#d29922]/30",
  completed: "text-on-surface-variant border-surface-variant",
  cancelled: "text-error border-error/30",
};

export const PIPELINE_LABELS: Record<string, string> = {
  discovered: "Discovered", watching: "Watching", interested: "Interested",
  applied: "Applied", accepted: "Accepted", rejected: "Rejected",
  withdrawn: "Withdrawn", workspace_created: "Workspace Created",
  active: "Active", submitted: "Submitted", judging: "Judging",
  completed: "Completed", archived: "Archived",
};
