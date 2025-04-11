import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import ErrorComponent from "@/components/common/errorModel";
import { Card } from "@/components/ui/card";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import { useGamingStats } from "@/hooks/analytics/useGamingAnalytics";
import { usePresenceActivity } from "@/hooks/analytics/usePresenceAnalytics";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { motion } from "framer-motion";
import ContentLoader from "react-content-loader";
import ActivityStatCard from "./components/ActivityStatCard";
import RolesSection from "./components/RolesSection";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ActivityChartsSection from "./components/ActivityChartsSection";
import { GamepadIcon } from "lucide-react";
import { ClockIcon } from "lucide-react";
import { UsersIcon } from "lucide-react";
interface ErrorType {
  message: string;
}

interface ChartDataPoint {
  date: string;
  count: number;
}

interface ChartData {
  data: ChartDataPoint[];
  color: string;
}

interface ActivityChartsSectionProps {
  data: {
    hourlyActivity: ChartData;
    statusBreakdown: ChartData;
    currentlyPlayedGames: ChartData;
  };
  className?: string;
}

interface ErrorComponentProps {
  title: string;
  message: string;
}

interface ActivityStatCardProps {
  index: number;
  title: string;
  value: string | number;
  isPositive: boolean;
  tooltip: string;
}

interface Role {
  id?: string;
  name: string;
  count: number;
  color?: string;
}

interface RolesSectionProps {
  roles: Role[];
}
const DeviceUsageTable = ({ data }: { data: { deviceType: string; count: number; percentage: number }[] }) => {
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <Card className="p-4">
      <Table>
        <TableCaption>Device Usage Distribution</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Device Type</TableHead>
            <TableHead className="text-right">Usage %</TableHead>
            <TableHead className="text-right">Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData?.map((device, index) => (
            <TableRow key={index} className="relative">
              <TableCell>{device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1)}</TableCell>
              <TableCell className="text-right">{device.percentage}%</TableCell>
              <TableCell className="text-right">{device.count}</TableCell>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${device.percentage}%` }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="absolute left-0 -top-8 bg-black text-white px-2 py-1 rounded opacity-0 pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {device.deviceType}: {device.count} devices, {device.percentage}% of total usage
              </motion.div>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};


const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const UserActivityAnalytics = () => {
  // Gaming analytics data
  const { currentlyPlayedGames, isLoading: gamingLoading, error: gamingError } = useGamingStats({ page: 1, limit: 10 });
  
  // Presence activity data
  const { 
    overview, 
    hourlyActivity,
    peakHours,
    deviceUsage,
    roleDistribution,
    isLoading: presenceLoading, 
    error: presenceError 
  } = usePresenceActivity();

  const {
    activeUsers,
  } = useDashboardData();

  // Loading and error states
  const isLoading = gamingLoading || presenceLoading;
  const error = gamingError || presenceError;

  // Data validation
  const hasValidData = overview && Object.keys(overview).length > 0;
  
  const formatDuration = (hours?: number, minutes?: number): string => {
    if (hours === undefined && minutes === undefined) return 'N/A';
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Stats data
  const statsData = hasValidData ? [
    {
      title: "Peak Activity Time",
      icon: <ClockIcon className="w-5 h-5" />,
      value: hourlyActivity?.peakHour
        ? `${String(hourlyActivity.peakHour).padStart(2, '0')}:00`
        : peakHours?.length > 0
          ? `${String(peakHours.reduce((max, curr) => 
              curr.users > max.users ? curr : max
            ).hour).padStart(2, '0')}:00`
          : "No Data",
      tooltip: "The hour of the day when user activity reaches its highest point",
    },
    {
      title: "Online Users", 
      icon: <UsersIcon className="w-5 h-5" />,
      value: (activeUsers?.today.count ?? 0).toLocaleString(),
      isPositive: true,
      tooltip: "Total number of users currently online and active on the server",
    },
    {
      title: "Avg Session Time",
      icon: <ClockIcon className="w-5 h-5" />,
      value: overview?.totalPresenceTime?.hours 
        ? formatDuration(
            Math.floor(overview.totalPresenceTime.hours / (activeUsers?.today.count ?? 0)),
            Math.floor((overview.totalPresenceTime.hours / (overview.activeUsers.count ?? 0)   % 1) * 60)
          )
        : "No Data",
      isPositive: true,
      tooltip: "Average time users spend connected in a single session",
    },
    {
      title: "Active Games (Now)",
      icon: <GamepadIcon className="w-5 h-5" />,
      value: (currentlyPlayedGames?.length ?? 0).toLocaleString(),
      isPositive: true,
      tooltip: "Number of different games currently being played by server members",
    }
  ] : [];

  // Transform data for charts
  const chartData = {
    totalUsers: {
      data: hourlyActivity?.hourlyDistribution?.map((count, hour) => ({
        date: `${String(hour).padStart(2, '0')}:00`,
        count,
      })) || [],
      color: "#4F46E5",
      label: "Total Users",
    },
    onlineUsers: {
      data: hourlyActivity?.statusDistribution?.online?.map((count, hour) => ({
        date: `${String(hour).padStart(2, '0')}:00`,
        count,
      })) || [],
      color: "#10B981",
      label: "Online",
    },
    idleUsers: {
      data: hourlyActivity?.statusDistribution?.idle?.map((count, hour) => ({
        date: `${String(hour).padStart(2, '0')}:00`,
        count,
      })) || [],
      color: "#F59E0B",
      label: "Idle",
    },
    dndUsers: {
      data: hourlyActivity?.statusDistribution?.dnd?.map((count, hour) => ({
        date: `${String(hour).padStart(2, '0')}:00`,
        count,
      })) || [],
      color: "#EF4444",
      label: "Do Not Disturb",
    },
    offlineUsers: {
      data: hourlyActivity?.statusDistribution?.offline?.map((count, hour) => ({
        date: `${String(hour).padStart(2, '0')}:00`,
        count,
      })) || [],
      color: "#6B7280",
      label: "Offline",
    },
    activeGames: {
      data: currentlyPlayedGames?.map(game => ({
        date: game.gameName,
        count: game.playerCount,
      })) || [],
      color: "#8B5CF6",
      label: "Active Games",
    },
    currentlyPlayedGames: {
      data: currentlyPlayedGames?.map(game => ({
        date: game.gameName,
        count: game.playerCount,
      })) || [],
      color: "#6366F1",
      label: "Popular Games",
    },
  };

  // Transform roles data
  const roles = roleDistribution ? {
    labels: roleDistribution.labels,
    data: roleDistribution.data,
    colors: roleDistribution.colors,
    totalUsers: roleDistribution.totalUsers
  } : {
    labels: [],
    data: [],
    colors: [],
    totalUsers: 0
  };

  const rolesData = roles?.labels?.map((label, i) => ({
    role: label,
    count: roles.data[i],
    percentage: ((roles.data[i] / roles.totalUsers) * 100).toFixed(2),
    color: roles.colors[i]
  }));

  return (
    <motion.div
      className="w-full min-h-screen bg-gray-50 p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div
        className="mx-auto"
        style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}
      >
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BreadcrumbsNavigation
            items={BREADCRUMB_PATHS[ROUTES.USER_ACTIVITY]}
          />
        </motion.div>

        {/* Activity Charts Section */}
        {isLoading ? (
          <Card className="p-6 w-full h-[466px] mb-10">
            <CardSkeleton width="100%" height="100%" />
          </Card>
        ) : hasValidData ? (
        <ActivityChartsSection
          className="mb-6" 
        />
        ) : (
          <ErrorComponent 
            title="Activity Data Error" 
            message={(error as ErrorType)?.message || "Failed to load activity data"}
          />
        )}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Stats Grid */}
          <div className="flex flex-col gap-4 md:gap-6 flex-1">          
            <div className="mb-4">
              {presenceLoading ? (
                <Card className="p-4">
                  <CardSkeleton width="100%" height="200px" />
                </Card>
              ) : deviceUsage?.length > 0 ? (
                <DeviceUsageTable data={deviceUsage} />
              ) : (
                <Card className="p-4">
                  <p className="text-center text-gray-500">No device usage data available</p>
                </Card>
              )}
            </div>
            
            <div className="info flex flex-col gap-2 w-full left-col">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="w-full p-4">
                    <CardSkeleton width="100%" height="60px" />
                  </Card>
                ))
              ) : hasValidData ? (
                <>
                  {statsData.map((stat, index) => (
                    <ActivityStatCard
                      key={index}
                      {...stat}
                      index={index}
                    />
                  ))}
                </>
              ) : (
                <ErrorComponent 
                  title="Stats Data Error" 
                  message={(error as ErrorType)?.message || "Failed to load statistics"}
                />
              )}
            </div>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <Card className="p-6 h-full">
                <CardSkeleton width="100%" height="100%" />
              </Card>
            ) : rolesData.length > 0 ? (
              <RolesSection data={rolesData} />
            ) : (
              <ErrorComponent 
                title="Roles Data Error" 
                message={(error as ErrorType)?.message || "Failed to load roles data"}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserActivityAnalytics;

