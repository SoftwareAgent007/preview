import PresenceWeekActivityChart from "@/components/charts/userActivityTimeline/presenceActivityChart/userPresenceWeekActivityChart";
import { motion } from "framer-motion";
import { useRef, useMemo } from "react";
import ActiveStatusChart from "./components/ActiveStatusChart";
import HourlyActivity from "./components/HourlyActivity";
import PeakActivityHours from "./components/PeakActivityHours";
import StatCard from "./components/StatCard";
import { usePresenceActivity } from "@/hooks/analytics/usePresenceAnalytics";
import ErrorComponent from "@/components/common/errorModel";
import ContentLoader from "react-content-loader";

// Skeleton loader for cards
const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const PresenceAnalytics = () => {
  const { overview, statusBreakdown, hourlyActivity, peakHours, isLoading, error } = usePresenceActivity("guildId", "week");

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const hasErrors = useMemo(() => Boolean(error), [error]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  // Safely format stats data with proper validation
  const getFormattedStatValue = (stat: any) => {
    if (!overview) return null;

    switch (stat.title) {
      case "Active Users":
        return overview.activeUsers?.count || null;
      case "Avg. Session Time":
        return overview.avgSessionTime?.hours !== undefined && overview.avgSessionTime?.minutes !== undefined
          ? `${overview.avgSessionTime.hours}h ${overview.avgSessionTime.minutes}m`
          : null;
      case "Peak Users":
        return overview.peakUsers?.count || null;
      case "Total Presence Time":
        return overview.totalPresenceTime?.hours !== undefined
          ? `${overview.totalPresenceTime.hours}h`
          : null;
      default:
        return null;
    }
  };

  const statsData = [
    { title: "Active Users", subtitle: overview?.activeUsers?.label || "Active users this period" },
    { title: "Avg. Session Time", subtitle: overview?.avgSessionTime?.label || "Average session duration" },
    { title: "Peak Users", subtitle: overview?.peakUsers?.label || "Maximum concurrent users" },
    { title: "Total Presence Time", subtitle: overview?.totalPresenceTime?.label || "Total presence duration" },
  ];

  // Display top-level error if request failed
  if (hasErrors && !isLoading) {
    return (
      <div className="w-full bg-gray-50 p-4 md:p-6">
        <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
          <ErrorComponent message="Failed to load presence analytics data" />
        </div>
      </div>
    );
  }

  return (
    <motion.div ref={wrapperRef} className="w-full bg-gray-50 p-4 md:p-6" variants={containerVariants} initial="hidden" animate="visible">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        
        {/* Stats Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {isLoading ? (
            <>
              <div className="bg-white rounded-lg shadow p-4">
                <CardSkeleton width="100%" height="100" />
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <CardSkeleton width="100%" height="100" />
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <CardSkeleton width="100%" height="100" />
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <CardSkeleton width="100%" height="100" />
              </div>
            </>
          ) : (
            statsData.map((stat, index) => {
              const value = getFormattedStatValue(stat);
              
              return value ? (
                <StatCard 
                  key={index} 
                  title={stat.title} 
                  value={value} 
                  subtitle={stat.subtitle} 
                  index={index} 
                />
              ) : (
                <div key={index} className="bg-white rounded-lg shadow p-4">
                  <ErrorComponent message={`${stat.title} data unavailable`} />
                </div>
              );
            })
          )}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <CardSkeleton width="100%" height="250" />
            ) : hourlyActivity.statusDistribution ? (
              <PresenceWeekActivityChart data={hourlyActivity.statusDistribution} />
            ) : (
              <ErrorComponent message="Weekly activity data unavailable" />
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="flex w-full h-full">
            <div className="bg-white rounded-lg shadow p-4 h-full w-full">
              {isLoading ? (
                <CardSkeleton width="100%" height="250" />
              ) : statusBreakdown && Array.isArray(statusBreakdown) && statusBreakdown.length > 0 ? (
                <ActiveStatusChart data={statusBreakdown} />
              ) : (
                <ErrorComponent message="Status breakdown data unavailable" />
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex">
            <div className="bg-white rounded-lg shadow p-4 h-full w-full">
              {isLoading ? (
                <CardSkeleton width="100%" height="250" />
              ) : peakHours && Array.isArray(peakHours) && peakHours.length > 0 ? (
                <PeakActivityHours hourlyActivity={peakHours} />
              ) : (
                <ErrorComponent message="Peak hours data unavailable" />
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex">
            <div className="bg-white rounded-lg shadow p-4 h-full w-full">
              {isLoading ? (
                <CardSkeleton width="100%" height="250" />
              ) : hourlyActivity?.hourlyDistribution && Array.isArray(hourlyActivity.hourlyDistribution) && hourlyActivity.hourlyDistribution.length > 0 ? (
                <HourlyActivity hourlyActivity={[]} />
              ) : (
                <ErrorComponent message="Hourly activity data unavailable" />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PresenceAnalytics;