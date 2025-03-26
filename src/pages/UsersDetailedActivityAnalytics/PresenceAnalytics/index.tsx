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
import { Info } from "lucide-react";
import { ClickableTooltip } from "@/components/ui/tooltip";
import HorizontalBarChart from "@/components/charts/hourActivity/HorizontalBarChart";
import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import ChartCard from "@/pages/Dashboard/components/ChartCard";

// Skeleton loader for cards
const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const PresenceAnalytics = () => {
  const { 
    overview, 
    statusBreakdown,
    peakHours,
    deviceUsage,
    roleDistribution, 
    isLoading, 
    error 
  } = usePresenceActivity("week");

  const {
    hourlyActivity,
    isLoading: isHourlyLoading,
    error: isHourlyError  
  } = useDashboardData();

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

  const statsData = [
    { 
      title: "Active Users", 
      subtitle: overview?.activeUsers?.label || "Active users this period",
      tooltip: "Number of unique users who have been active during the selected time period",
      formatValue: (val?: number) => val?.toLocaleString() || '0'
    },
    { 
      title: "Avg. Session Time", 
      subtitle: overview?.avgSessionTime?.label || "Average session duration",
      tooltip: "Average time users spend active in a single session",
      formatValue: (minutes?: number) => {
        if (!minutes) return '0m';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours === 0) return `${remainingMinutes}m`;
        if (remainingMinutes === 0) return `${hours}h`;
        return `${hours}h ${remainingMinutes}m`;
      }
    },
    { 
      title: "Peak Users", 
      subtitle: overview?.peakUsers?.label || "Maximum concurrent users",
      tooltip: "Highest number of users active at the same time",
      formatValue: (val?: number) => val?.toLocaleString() || '0'
    },
    { 
      title: "Total Presence Time", 
      subtitle: overview?.totalPresenceTime?.label || "Total presence duration",
      tooltip: "Total cumulative time all users have been present",
      formatValue: (hours?: number) => {
        if (!hours) return '0h';
        if (hours >= 24) {
          const days = Math.floor(hours / 24);
          const remainingHours = hours % 24;
          return `${days}d ${remainingHours}h`;
        }
        return `${hours}h`;
      }
    },
  ];

  // Safely format stats data with proper validation
  const getFormattedStatValue = (stat: any) => {
    if (!overview) return null;

    switch (stat.title) {
      case "Active Users":
        return stat.formatValue(overview.activeUsers?.count);
      case "Avg. Session Time":
        return stat.formatValue(overview.avgSessionTime?.minutes);
      case "Peak Users":
        return stat.formatValue(overview.peakUsers?.count);
      case "Total Presence Time":
        return stat.formatValue(overview.totalPresenceTime?.hours);
      default:
        return null;
    }
  };

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
              
              return (
                <>
                  {value !== null ? (
                    <StatCard 
                      title={
                        <div className="flex items-center gap-2">
                          {stat.title}
                          <ClickableTooltip content={stat.tooltip}>
                            <Info className="w-4 h-4 text-gray-500" />
                          </ClickableTooltip>
                        </div>
                      }
                      value={value} 
                      subtitle={stat.subtitle} 
                      index={index} 
                      />
                  ) : (
                    <ErrorComponent message={`${stat.title} data unavailable`} />
                  )}
                </>
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

          {isLoading ? (
            <CardSkeleton width="100%" height="250" />
          ) : statusBreakdown && Array.isArray(statusBreakdown) && statusBreakdown.length > 0 ? (
            <ActiveStatusChart data={statusBreakdown} />
          ) : (
            <ErrorComponent message="Status breakdown data unavailable" />
          )}

          {isLoading ? (
            <CardSkeleton width="100%" height="250" />
          ) : peakHours && Array.isArray(peakHours) && peakHours.length > 0 ? (
            <PeakActivityHours hourlyActivity={peakHours} />
          ) : (
            <ErrorComponent message="Peak hours data unavailable" />
          )}

          {isLoading || isHourlyLoading ? (
            <CardSkeleton width="100%" height="500px" />
          ) : (
            <ChartCard
              title="Hourly Activity"
              tooltipContent="Displays the number of users at different hours of the day"
              index={0}
              className="flex-1"
            >
              {isHourlyError ? (
                <ErrorComponent />
              ) : (
                <HorizontalBarChart
                  data={hourlyActivity?.hourlyDistribution ?? []}
                  height={500}
                  width={600}
                />
              )}
            </ChartCard>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PresenceAnalytics;