import { BreadcrumbItem } from "@/common/interfaces/Breadcrumbs.interface";

export const ROUTES = {
  DASHBOARD: '/',
  KEYWORD_ANALYTICS: '/keyword-analytics',
  USER_ACTIVITY: '/user-activity',
  USER_ACTIVITY_DETAILED: '/user-activity/detailed',
  USER_ACTIVITY_DETAILED_STATUS: '/user-activity/detailed/status',
  USER_ACTIVITY_DETAILED_GAMING: '/user-activity/detailed/gaming', 
  USER_ACTIVITY_DETAILED_PRESENCE: '/user-activity/detailed/presence',
  MUSIC_METRICS: '/music-metrics'
} as const;

export const BREADCRUMB_PATHS: Record<string, BreadcrumbItem[]> = {
  [ROUTES.DASHBOARD]: [
    { label: 'Dashboard' }
  ],
  [ROUTES.KEYWORD_ANALYTICS]: [
    { label: 'Dashboard', path: ROUTES.DASHBOARD },
    { label: 'Keyword Analytics' }
  ],
  [ROUTES.USER_ACTIVITY]: [
    { label: 'Dashboard', path: ROUTES.DASHBOARD },
    { label: 'User Activity Analytics' }
  ],
  [ROUTES.USER_ACTIVITY_DETAILED]: [
    { label: 'Dashboard', path: ROUTES.DASHBOARD },
    { label: 'User Activity Analytics', path: ROUTES.USER_ACTIVITY },
    { label: 'Users Detailed Activity Analytics' }
  ],
  [ROUTES.USER_ACTIVITY_DETAILED_STATUS]: [
    { label: 'Dashboard', path: ROUTES.DASHBOARD },
    { label: 'User Activity Analytics', path: ROUTES.USER_ACTIVITY },
    { label: 'Users Detailed Activity Analytics', path: ROUTES.USER_ACTIVITY_DETAILED },
    { label: 'Status' }
  ],
  [ROUTES.USER_ACTIVITY_DETAILED_GAMING]: [
    { label: 'Dashboard', path: ROUTES.DASHBOARD },
    { label: 'User Activity Analytics', path: ROUTES.USER_ACTIVITY },
    { label: 'Users Detailed Activity Analytics', path: ROUTES.USER_ACTIVITY_DETAILED },
    { label: 'Gaming' }
  ],
  [ROUTES.USER_ACTIVITY_DETAILED_PRESENCE]: [
    { label: 'Dashboard', path: ROUTES.DASHBOARD },
    { label: 'User Activity Analytics', path: ROUTES.USER_ACTIVITY },
    { label: 'Users Detailed Activity Analytics', path: ROUTES.USER_ACTIVITY_DETAILED },
    { label: 'Presence' }
  ],
  [ROUTES.MUSIC_METRICS]: [
    { label: 'Dashboard', path: ROUTES.DASHBOARD },
    { label: 'Music Metrics' }
  ]
} as const;
