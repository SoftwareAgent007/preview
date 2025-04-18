import { BreadcrumbItem } from "@/common/interfaces/Breadcrumbs.interface";

export const ROUTES = {
  // Auth routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  ASSIGN_GUILD: "/assign-guild",

  // Dashboard routes
  DASHBOARD: "/",
  KEYWORD_ANALYTICS: "/keyword-analytics",
  USER_ACTIVITY: "/user-activity",
  USER_ACTIVITY_DETAILED: "/user-activity/detailed",
  USER_ACTIVITY_DETAILED_STATUS: "/user-activity/detailed/status",
  USER_ACTIVITY_DETAILED_GAMING: "/user-activity/detailed/gaming",
  USER_ACTIVITY_DETAILED_PRESENCE: "/user-activity/detailed/presence",
  MUSIC_METRICS: "/music-metrics",
  ADMIN: "/admin",
  MESSAGE_REACTIONS: "/message-reactions",
  AUDIT_LOGS: "/audit-logs",
  AGENCY_PARTNER_DASHBOARD: "/agency-partner-dashboard",
  CLIENT_DASHBOARD: "/client-dashboard",
} as const;

export const BREADCRUMB_PATHS: Record<string, BreadcrumbItem[]> = {
  [ROUTES.DASHBOARD]: [{ label: "Dashboard" }],
  [ROUTES.KEYWORD_ANALYTICS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Keyword Analytics" },
  ],
  [ROUTES.USER_ACTIVITY]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "User Activity Analytics" },
  ],
  [ROUTES.USER_ACTIVITY_DETAILED]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "User Activity Analytics", path: ROUTES.USER_ACTIVITY },
    { label: "Users Detailed Activity Analytics" },
  ],
  [ROUTES.USER_ACTIVITY_DETAILED_STATUS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "User Activity Analytics", path: ROUTES.USER_ACTIVITY },
    {
      label: "Users Detailed Activity Analytics",
      path: ROUTES.USER_ACTIVITY,
    },
    { label: "Status" },
  ],
  [ROUTES.USER_ACTIVITY_DETAILED_GAMING]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "User Activity Analytics", path: ROUTES.USER_ACTIVITY },
    {
      label: "Users Detailed Activity Analytics",
      path: ROUTES.USER_ACTIVITY,
    },
    { label: "Gaming" },
  ],
  [ROUTES.USER_ACTIVITY_DETAILED_PRESENCE]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "User Activity Analytics", path: ROUTES.USER_ACTIVITY },
    {
      label: "Users Detailed Activity Analytics",
      path: ROUTES.USER_ACTIVITY,
    },
    { label: "Presence" },
  ],
  [ROUTES.MUSIC_METRICS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Music Metrics" },
  ],
  [ROUTES.ADMIN]: [
    { label: "Dashboard", path: ROUTES.ADMIN },
    { label: "Admin" },
  ],
  // [ROUTES.MESSAGE_REACTIONS]: [
  //   { label: "Dashboard", path: ROUTES.DASHBOARD },
  //   { label: "Message reaction", path: ROUTES.MESSAGE_REACTIONS },
  // ],
  [ROUTES.ASSIGN_GUILD]: [
    { label: "Assign Guild", path: ROUTES.ASSIGN_GUILD }
  ],
  [ROUTES.AUDIT_LOGS]: [
    { label: "Dashboard", path: ROUTES.DASHBOARD },
    { label: "Audit Logs" },
  ],
} as const;
