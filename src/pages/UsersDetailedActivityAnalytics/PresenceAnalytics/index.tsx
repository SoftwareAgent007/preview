import PresenceWeekActivityChart from "@/components/charts/userActivityTimeline/presenceActivityChart/userPresenceWeekActivityChart";
import { motion } from "framer-motion";
import { useRef, useMemo, useState, useEffect } from "react";
import ActiveStatusChart from "./components/ActiveStatusChart";
import PeakActivityHours from "./components/PeakActivityHours";
import StatCard from "./components/StatCard";
import { usePresenceActivity } from "@/hooks/analytics/usePresenceAnalytics";
import ErrorComponent from "@/components/common/errorModel";
import ContentLoader from "react-content-loader";
import { Info, Loader2 } from "lucide-react";
import { ClickableTooltip } from "@/components/ui/tooltip";
import HorizontalBarChart from "@/components/charts/hourActivity/HorizontalBarChart";
import { useActivityData, useDashboardData } from "@/hooks/analytics/useDashboardData";
import ChartCard from "@/pages/Dashboard/components/ChartCard";
import { Card } from "@/components/ui/card";

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
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const presenceChartRef = useRef<HTMLDivElement | null>(null);
  const peakHoursRef = useRef<HTMLDivElement | null>(null);
  const horizontalChartRef = useRef<HTMLDivElement | null>(null);
  
  const [presenceChartWidth, setPresenceChartWidth] = useState(0);
  const [peakHoursWidth, setPeakHoursWidth] = useState(0);
  const [horizontalChartWidth, setHorizontalChartWidth] = useState(0);
  
  const hasErrors = useMemo(() => Boolean(error), [error]);
  const [activityHourlyDate, setActivityHourlyDate] = useState(new Date());
  
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (horizontalChartRef.current) {
        setHorizontalChartWidth(horizontalChartRef.current.offsetWidth || 0);
      }
    });
    
    if (horizontalChartRef.current) {
      resizeObserver.observe(horizontalChartRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [horizontalChartRef.current]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (presenceChartRef.current) {
        setPresenceChartWidth(presenceChartRef.current.offsetWidth || 0);
      }
    });
    
    if (presenceChartRef.current) {
      resizeObserver.observe(presenceChartRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [presenceChartRef.current]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (peakHoursRef.current) {
        setPeakHoursWidth(peakHoursRef.current.offsetWidth * 0.8 || 0);
      }
    });
    
    if (peakHoursRef.current) {
      resizeObserver.observe(peakHoursRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [peakHoursRef.current]);

  const {
    hourlyActivity,
    isLoading: isHourlyLoading,
    error: isHourlyError  
  } = useActivityData(activityHourlyDate);

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
        return hours === 0 ? `${remainingMinutes}m` : `${hours}h ${remainingMinutes}m`;
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
          return `${days.toLocaleString()}d ${remainingHours.toLocaleString()}h`;
        }
        return `${hours.toLocaleString()}h`;
      }
    },
  ];

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
        
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {statsData.map((stat, index) => {
            const value = getFormattedStatValue(stat);
            
            return (
              <StatCard 
                key={stat.title}
                title={
                  <div className="flex items-center gap-2">
                    {stat.title}
                    <ClickableTooltip content={
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {stat.tooltip}
                      </motion.p>
                    }>
                      <motion.span
                        className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: "rgba(209, 213, 219, 0.4)",
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ?
                      </motion.span>
                    </ClickableTooltip>
                  </div>
                }
                value={isLoading ? <CardSkeleton width="100%" height="24" /> : value} 
                subtitle={stat.subtitle} 
                index={index} 
              />
            );
          })}
        </motion.div>
        <div className={`grid grid-cols-1 ${wrapperRef.current && wrapperRef.current.offsetWidth >= 800 ? 'lg:grid-cols-2' : ''} gap-6 mb-6`}>
          <motion.div variants={itemVariants} ref={presenceChartRef}>
              {isLoading || isHourlyLoading ? (
              <Card className="p-6">
                <CardSkeleton width="100%" height="470" />
              </Card>
              ) : hourlyActivity?.statusDistribution ? (
                <PresenceWeekActivityChart pageWrapperWidth={wrapperRef?.current?.offsetWidth} chartWrapperWidth={presenceChartWidth} data={hourlyActivity.statusDistribution} />
              ) : (
                <ErrorComponent message="Weekly activity data unavailable" />
              )}
          </motion.div>

          <motion.div variants={itemVariants}>
              {isLoading ? (
              <Card className="p-6">
                <CardSkeleton width="100%" height="470" />
              </Card>
              ) : statusBreakdown && Array.isArray(statusBreakdown) && statusBreakdown.length > 0 ? (
                <ActiveStatusChart data={statusBreakdown} />
              ) : (
                <ErrorComponent message="Status breakdown data unavailable" />
              )}
          </motion.div>

          <motion.div variants={itemVariants} ref={peakHoursRef}>
              {isLoading ? (
              <Card className="p-6">
                <CardSkeleton width="100%" height="470" />
              </Card>
              ) : peakHours && Array.isArray(peakHours) && peakHours.length > 0 ? (
                <PeakActivityHours hourlyActivity={peakHours} width={peakHoursWidth} />
              ) : (
                <ErrorComponent message="Peak hours data unavailable" />
              )}
          </motion.div>

          <ChartCard
            title={isLoading ? "" : "Hourly Activity"}
            tooltipContent="Displays the number of users at different hours of the day"
            index={0}
            className="flex-1"              
            setRef={(ref) => horizontalChartRef.current = ref}
          >
            {isLoading ? (
              <CardSkeleton width="100%" height="470" />
            ) : (
              <HorizontalBarChart
                data={hourlyActivity?.hourlyDistribution ?? []}
                height={500}
                width={horizontalChartWidth}
                isLoading={isHourlyLoading}
                isError={!!isHourlyError}
                onDateChange={setActivityHourlyDate}
              />
            )}
          </ChartCard>
        </div>
      </div>
    </motion.div>
  );
};

export default PresenceAnalytics;