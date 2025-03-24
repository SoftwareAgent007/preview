import { motion } from "framer-motion";
import ActivityCharts from "@/components/charts/userActivityTimeline/expandedUserActivityCharts";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { usePeakHours } from "@/hooks/analytics/useGamingPeakHours";
import { useUserActivityAnalytics } from "@/hooks/analytics/useUserActivityAnalytics";
import type { UserActivityAnalytics } from "@/hooks/analytics/useUserActivityAnalytics";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import { usePlayingStatisticData } from "@/hooks/analytics/usePlayingStatisticData";
import ContentLoader from "react-content-loader";
import ErrorComponent from "@/components/common/errorModel";
import ActivityStatCard from "./components/ActivityStatCard";
import ActivityChartsSection from "./components/ActivityChartsSection";
import RolesSection from "./components/RolesSection";

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const UserActivityAnalytics = () => {
  // Core data from HEAD branch
  const { activeRoles, avgSessionTime, joins, leaves, isLoading: activityLoading, error: activityError } = useUserActivityAnalytics("");
  const { peakHours, isLoading: peakLoading, error: peakError } = usePeakHours("");
  const { totalUsers, activeUsers, isLoading: dashboardLoading, error: dashboardError } = useDashboardData("year");
  
  // Enhanced data from dev branch
  const data = useUserActivityAnalytics('month');
  const { playingUserStats } = usePlayingStatisticData('month');

  // Loading and error states
  const isLoading = activityLoading || peakLoading || dashboardLoading;

  // Data validation
  const hasValidData = totalUsers || activeUsers || avgSessionTime || joins || leaves || (data && Object.keys(data).length > 0);

  // Animation variants from dev branch
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Combine stats data from both branches
  const statsData = hasValidData ? [
    {
      title: "Peak Activity Time",
      value: data?.hourlyActivity?.peakHour 
        ? new Date(data.hourlyActivity.peakHour).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : peakHours?.[0]?.hour || "No data",
      // trend: data?.hourlyActivity?.hourlyDistribution?.[0],
      isPositive: true,
    },
    {
      title: "Online Users",
      value: data?.activityOverview?.activeUsers?.count || totalUsers?.count || "No data",
      // trend: data?.activityOverview?.activeUsers?.count,
      isPositive: true,
    },
    {
      title: "Avg Session Time",
      value: data?.avgSessionTime?.formattedDuration || avgSessionTime?.formattedDuration || "0",
      // trend: data?.avgSessionTime?.change,
      isPositive: true,
      unit: "minutes",
    },
    {
      title: "Playing Now",
      value: data?.activityOverview?.peakUsers?.count || activeUsers?.count || "No data",
      // trend: data?.activityOverview?.peakUsers?.count,
      isPositive: true,
    },
    {
      title: "Joins",
      value: joins || data?.joins?.count || 0,
      // trend: 1.3,
      isPositive: true,
    },
    {
      title: "Leaves",
      value: leaves || data?.leaves?.count || 0,
      // trend: 12.1,
      isPositive: false,
    },
  ] : [];

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
          <Card className="p-6 w-full h-[300px]">
            <CardSkeleton width="100%" height="100%" />
          </Card>
        ) : hasValidData ? (
          playingUserStats && Object.keys(playingUserStats).length > 0 ? (
            <ActivityChartsSection data={playingUserStats} className="mb-6" />
          ) : (
            <ActivityCharts data={{}} className="mb-6" />
          )
        ) : (
          <ErrorComponent 
            title="Activity Data Error" 
            message={activityError?.message || "Failed to load activity data"} 
          />
        )}

        <div className="flex flex-col lg:flex-row gap-6">
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
                    index={index}
                    title={stat.title}
                    value={stat.value}
                    trend={0}
                    isPositive={stat.isPositive}
                    unit={stat.unit}
                  />
                ))}
              </>
            ) : (
              <ErrorComponent 
                title="Dashboard Data Error" 
                message={dashboardError?.message || "Failed to load dashboard statistics"} 
              />
            )}
          </div>

          {/* Roles Section */}
          <div className="flex-1">
            {isLoading ? (
              <Card className="p-6 h-full">
                <CardSkeleton width="100%" height="100%" />
              </Card>
            ) : activeRoles?.length > 0 ? (
              <RolesSection />
            ) : (
              <ErrorComponent 
                title="Peak Hours Error" 
                message={peakError?.message || "Failed to load roles data"} 
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default UserActivityAnalytics;