import PresenceWeekActivityChart from "@/components/charts/userActivityTimeline/presenceActivityChart/userPresenceWeekActivityChart";
import { motion } from "framer-motion";
import { useRef } from "react";
import ActiveStatusChart from "./components/ActiveStatusChart";
import HourlyActivity from "./components/HourlyActivity";
import PeakActivityHours from "./components/PeakActivityHours";
import StatCard from "./components/StatCard";
import { usePresenceActivity } from "@/hooks/analytics/usePresenceAnalytics";

const PresenceAnalytics = () => {
  const presenceAnalyticsResponse = usePresenceActivity("guildId", "week"); // Provide valid parameters
  const {
    overview = {
      activeUsers: { count: 0, label: "" },
      avgSessionTime: { hours: 0, minutes: 0, label: "" },
      totalPresenceTime: { hours: 0, label: "" },
      peakUsers: { count: 0, label: "" },
    },
    statusBreakdown = [],
    hourlyActivity = { hourlyDistribution: [] },
    peakHours = [],
  } = presenceAnalyticsResponse || {};

  const { activeUsers, avgSessionTime, totalPresenceTime, peakUsers } = overview;

  const wrapperRef = useRef<HTMLDivElement | null>(null);

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
    { title: "Active Users", value: activeUsers.count, subtitle: activeUsers.label },
    { title: "Avg. Session Time", value: `${avgSessionTime.hours}h ${avgSessionTime.minutes}m`, subtitle: avgSessionTime.label },
    { title: "Peak Users", value: peakUsers.count, subtitle: peakUsers.label },
    { title: "Total Presence Time", value: `${totalPresenceTime.hours}h`, subtitle: totalPresenceTime.label },
  ];

  return (
    <motion.div ref={wrapperRef} className="w-full bg-gray-50 p-4 md:p-6" variants={containerVariants} initial="hidden" animate="visible">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        
        {/* Stats Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} index={index} />
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div variants={itemVariants}>
            <PresenceWeekActivityChart />
          </motion.div>

          <motion.div variants={itemVariants} className="flex w-full h-full">
            <ActiveStatusChart data={statusBreakdown} />
          </motion.div>

          <motion.div variants={itemVariants} className="flex">
            <PeakActivityHours hourlyActivity={peakHours} />
          </motion.div>

          <motion.div variants={itemVariants} className="flex">
            {/* <HourlyActivity hourlyActivity={hourlyActivity.hourlyDistribution} /> */}
            {/* HourlyActivity have to be implemented by fixed data in api */}
            <HourlyActivity hourlyActivity={[]} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PresenceAnalytics;
