export type NotificationType = "info" | "success" | "warning" | "error";

export type NotificationCategory =
  | "general"
  | "task"
  | "project"
  | "event"
  | "submission"
  | "judging"
  | "member"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message?: string;
  persistent: boolean;
  dismissible: boolean;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  taskAssigned: boolean;
  taskUpdated: boolean;
  memberJoined: boolean;
  submissionCreated: boolean;
  judgingComplete: boolean;
  eventReminder: boolean;
  systemAnnouncement: boolean;
}
