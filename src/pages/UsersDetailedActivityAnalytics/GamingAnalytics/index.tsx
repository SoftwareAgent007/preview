import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useGamingAnalyticsResponse } from "@/hooks/fetchData";
import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChart";

import StatCard from "./components/StatCard";
import TopGamesList from "./components/TopGamesList";
import ActiveRolesChart from "./components/ActiveRolesChart";

const GamingAnalytics = () => {
  // #region Hooks and State
  const gamingAnalyticsResponse = useGamingAnalyticsResponse();
  const { 
    activeUsers = 0,
    avgSessionTime = 0,
    totalGameTime = 0,
    peakPlayers = 0,
    activeRolesPlayingNow = [],
    topGames = []
  } = gamingAnalyticsResponse || {};

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [graphWidth, setGraphWidth] = useState(0);
  // #endregion

  // #region Effects
  useEffect(() => {
    const updateGraphWidth = () => {
      if (wrapperRef.current) {
        setGraphWidth(wrapperRef.current.offsetWidth / 2.3);
      }
    };

    window.addEventListener("resize", updateGraphWidth);
    updateGraphWidth();
    return () => window.removeEventListener("resize", updateGraphWidth);
  }, [wrapperRef.current]);
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
    { title: "Peak Players", value: peakPlayers, subtitle: "Highest concurrent players" },
    { title: "Total Game Time", value: totalGameTime, subtitle: "Total hours played" }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            className="grid gap-6"
            variants={itemVariants}
          >
            <TopGamesList topGames={topGames} />
            <motion.div variants={itemVariants}>
              <Card className="p-6 h-full">
                <UserActivityTimeline width={graphWidth} />
              </Card>
            </motion.div>
          </motion.div>
          
          {/* Active Roles Chart */}
          <ActiveRolesChart data={activeRolesPlayingNow} />
        </div>
        {/* #endregion */}
      </div>
    </motion.div>
  );
};

export default GamingAnalytics;