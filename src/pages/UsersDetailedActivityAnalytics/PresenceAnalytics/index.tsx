import { useRef } from "react";
import { motion } from "framer-motion";
import { usePresenceAnalyticsResponse } from "@/hooks/fetchData";
import PresenceWeekActivityChart from "@/components/charts/userActivityTimeline/presenceActivityChart/userPresenceWeekActivityChart";
import StatCard from "./components/StatCard";
import ActiveStatusChart from "./components/ActiveStatusChart";
import ActivityCharts from "./components/ActivityChart";

const PresenceAnalytics = () => {
  // #region Hooks and State
  const presenceAnalyticsResponse = usePresenceAnalyticsResponse();
  const { 
    activeUsers = 0,
    avgSessionTime = 0,
    totalPresenceTime = 0,
    peakUsers = 0,
    activeRolesNow = [],
    hourlyActivity = [],
  } = presenceAnalyticsResponse || {};

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // #endregion

  // #region Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };
  // #endregion

  // #region Stats Data
  const statsData = [
    { title: "Active Users", value: activeUsers, subtitle: "Currently active users" },
    { title: "Avg. Session Time", value: avgSessionTime, subtitle: "Average session duration" },
    { title: "Peak Users", value: peakUsers, subtitle: "Highest concurrent users" },
    { title: "Total Presence Time", value: totalPresenceTime, subtitle: "Total hours present" }
  ];
  // #endregion

  return (
    <motion.div 
      ref={wrapperRef} 
      className="w-full bg-gray-50 p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        {/* #region Stats Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} index={index} />
          ))}
        </motion.div>
        {/* #endregion */}

        {/* #region Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div variants={itemVariants}>
            <PresenceWeekActivityChart />
          </motion.div>
          
          {/* //TODO: Replace any with proper type */}
          <ActiveStatusChart data={activeRolesNow as any[]} />
          
          <ActivityCharts hourlyActivity={hourlyActivity} />
        </div>
        {/* #endregion */}
      </div>
    </motion.div>
  );
};

export default PresenceAnalytics;