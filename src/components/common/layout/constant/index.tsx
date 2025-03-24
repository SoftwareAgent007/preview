import { ROUTES } from "@/routes/routes.constant";
import { 
  Home,
  BarChart2,
  Users,
  UserCircle,
  Calendar,
  ArrowUpDown,
  MessageSquare,
  Music2,
  GamepadIcon,
  ShoppingCart,
  Activity,
} from "lucide-react";

interface MenuItem {
  icon: JSX.Element;
  label: string;
  path: string;
  beta?: boolean;
  nested?: {
    label: string;
    path: string;
  }[];
}

interface MenuCategories {
  [key: string]: MenuItem[];
}

export const menuCategories: MenuCategories = {
  Analytics: [
    { icon: <Home />, label: "Homepage", path: ROUTES.DASHBOARD },
    { icon: <BarChart2 />, label: "Keyword", path: ROUTES.KEYWORD_ANALYTICS },
    { icon: <Users />, label: "User Activity", path: ROUTES.USER_ACTIVITY },
    { 
      icon: <Activity />, 
      label: "User Activity Detailed", 
      path: ROUTES.USER_ACTIVITY_DETAILED,
      nested: [
        { label: "Gaming", path: "/user-activity/detailed/gaming" },
        { label: "Presence", path: "/user-activity/detailed/presence" },
      ]
    },
    { icon: <Music2 />, label: "Music Metrics", path: ROUTES.MUSIC_METRICS, beta: true },
    { icon: <MessageSquare />, label: "Message Reactions", path: ROUTES.MESSAGE_REACTIONS },
  ],
  // Community: [
  //   { icon: <UserCircle />, label: "Members", path: "/members" },
  //   { icon: <Calendar />, label: "Scheduled posts", path: "/scheduled" },
  //   { icon: <ArrowUpDown />, label: "Levelling", path: "/levelling" },
  //   { icon: <MessageSquare />, label: "UGC", path: "/ugc" },
  // ],
  // Integrations: [
  //   { icon: <Music2 />, label: "Streaming", path: "/streaming" },
  //   { icon: <GamepadIcon />, label: "Gaming", path: "/gaming" },
  //   { icon: <ShoppingCart />, label: "Ecommerce", path: "/ecommerce" },
  // ],
};