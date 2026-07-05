export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 56;
export const TOPNAV_HEIGHT = 48;
export const FOOTER_HEIGHT = 24;
export const INSPECTOR_WIDTH = 360;
export const INSPECTOR_MIN_WIDTH = 280;
export const INSPECTOR_MAX_WIDTH = 640;

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const;

export const STATUS = {
  ACTIVE: "active",
  IDLE: "idle",
  PAUSED: "paused",
  ERROR: "error",
  ARCHIVED: "archived",
} as const;
