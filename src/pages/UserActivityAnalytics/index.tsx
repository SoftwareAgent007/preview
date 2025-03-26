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
    activeGames: ChartData;
    popularGames: ChartData;
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
  trend?: number;
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

const DeviceUsageTable = ({ data }: { data: { deviceType: string; percentage: number }[] }) => {
  return (
    <Card className="p-4">
      <Table>
        <TableCaption>Device Usage Distribution</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Device Type</TableHead>
            <TableHead className="text-right">Usage %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((device, index) => (
            <TableRow key={index}>
              <TableCell>{device.deviceType}</TableCell>
              <TableCell className="text-right">{device.percentage}%</TableCell>
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
  const { activeGames, popularGames, isLoading: gamingLoading, error: gamingError } = useGamingStats({ page: 1, limit: 10 });
  
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

  // Dashboard data
  const { isLoading: dashboardLoading, error: dashboardError } = useDashboardData();

  // Loading and error states
  const isLoading = gamingLoading || presenceLoading || dashboardLoading;
  const error = gamingError || presenceError || dashboardError;

  // Data validation
  const hasValidData = overview && Object.keys(overview).length > 0;

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
      value: hourlyActivity?.peakHour
        ? `${String(hourlyActivity.peakHour).padStart(2, '0')}:00`
        : peakHours?.length > 0
          ? `${String(peakHours.reduce((max, curr) => 
              curr.users > max.users ? curr : max
            ).hour).padStart(2, '0')}:00`
          : "No data",
      trend: 0,
    },
    {
      title: "Online Users",
      value: overview?.activeUsers?.count || "No data",
      isPositive: true,
      trend: 0,
    },
    {
      title: "Avg Session Time",
      value: overview?.totalPresenceTime?.hours 
        ? `${(overview.totalPresenceTime.hours / 100 / overview?.activeUsers?.count).toFixed(2)}h ${overview.totalPresenceTime.minutes || 0}m`
        : "No data",
      isPositive: true,
      trend: 0,
    },
    {
      title: "Active Games (now)",
      value: activeGames?.length || "No data",
      isPositive: true,
      trend: 0,
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
      data: activeGames?.map(game => ({
        date: game.gameName,
        count: game.playerCount,
      })) || [],
      color: "#8B5CF6",
      label: "Active Games",
    },
    popularGames: {
      data: popularGames?.map(game => ({
        date: game.gameName,
        count: game.uniquePlayers,
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
          <Card className="p-6 w-full h-[300px] mb-10">
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

        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 flex-1">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="flex-1 p-6">
                  <CardSkeleton width="100%" height="100px" />
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
        
        <div className="col-span-1 w-1/2 pr-2">
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

      </div>
    </motion.div>
  );
};

export default UserActivityAnalytics;

