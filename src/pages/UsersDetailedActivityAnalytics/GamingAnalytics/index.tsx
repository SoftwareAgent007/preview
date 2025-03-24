import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import AreaLineChart from "@/components/charts/AreaLineChart";
import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChart";
import ErrorComponent from "@/components/common/errorModel";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { useGameDetails, useGamingStats } from "@/hooks/analytics/useGamingAnalytics";
import ContentLoader from "react-content-loader";
import StatCard from "./components/StatCard";
import ActiveRolesChart from "./components/ActiveRolesChart";
import { ActiveGamesList } from "./components/activeGamesList";
import TopGamesList from "./components/topGamesList";

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const GamingAnalytics = ({ guildId = "1w2dd" }) => {
  const { activeGames, popularGames, isLoading } = useGamingStats();
  const { gameStats } = useGameDetails("CS2");

  const {
    totalPlayers = 0,
    avgSessionMinutes = 0,
    peakPartySize = 0,
    totalHours = 0,
    returnRate = 0,
    weeklyTrends = [],
    peakHours = []
  } = gameStats || {};

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [graphWidth, setGraphWidth] = useState(0);

  // Effects
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

  // Animation Variants
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

  // Updated Stats Data with all available fields
  const statsData = [
    { title: "Active Users", value: totalPlayers, subtitle: "Currently active users" },
    { title: "Avg. Session Time", value: avgSessionMinutes, subtitle: "Average session duration", unit: "min" },
    { title: "Peak Players", value: peakPartySize, subtitle: "Highest concurrent players" },
    { title: "Total Game Time", value: totalHours, subtitle: "Total hours played", unit: "hrs" },
  ];

  return (
    <motion.div 
      ref={wrapperRef} 
      className="w-full bg-gray-50 p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        {/* Stats Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex-1 p-6 h-30">
                  <CardSkeleton width="100%" height="120" />
                </Card>
              ))}
            </>
          ) : (
            <>
              {statsData.map((stat, index) => (
                <StatCard key={index} {...stat} index={index} />
              ))}
            </>
          )}
        </motion.div>

        {/* Main Gaming Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            className="grid gap-6"
            variants={itemVariants}
          >
            {isLoading ? (
              <>
                <Card className="p-6"><CardSkeleton width="100%" height="500" /></Card>
                <Card className="p-6 h-[400px]"><CardSkeleton width="100%" height="350" /></Card>
              </>
            ) : (
              <>
                <TopGamesList topGames={popularGames} />                  
                <motion.div variants={itemVariants}>
                  <Card className="p-6 h-[400px]">
                    {weeklyTrends?.length > 0 ? (
                      <AreaLineChart data={weeklyTrends.map(trend => ({
                        date: trend.weekStartDate,
                        count: trend.totalUsers
                      }))} width={graphWidth} height={300} graphColor="#b1c4f5" />
                    ) : (
                      <UserActivityTimeline width={graphWidth} activityTimeline={[]} />
                    )}
                  </Card>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Active Games Section */}
          <motion.div 
            className="grid gap-6"
            variants={itemVariants}
          >
            {isLoading ? (
              <Card className="p-6"><CardSkeleton width="100%" height="550" /></Card>
            ) : (
              <>
                <Card className="p-6 h-full">
                  <div className="title text-gray-500 text-lg font-bold mb-4">
                    <span className="mr-5">Active Games</span>
                    <ClickableTooltip content={<p><strong>Active Games: </strong> Current active games being played.</p>}>
                      <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
                    </ClickableTooltip>
                  </div>
                  {activeGames?.length > 0 ? (
                    <ActiveGamesList topGames={activeGames} />
                  ) : (
                    <ErrorComponent height={530} />
                  )}
                </Card>

                <Card className="p-6">
                  <div className="title text-gray-500 text-lg font-bold mb-4">
                    <span className="mr-5">Peak Hours Distribution</span>
                    <ClickableTooltip content={<p><strong>Peak Hours: </strong> Player activity by hour of day.</p>}>
                      <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
                    </ClickableTooltip>
                  </div>
                  {peakHours?.length > 0 ? (
                    <AreaLineChart 
                      data={peakHours.map(peak => ({
                        date: new Date(2024, 0, 1, peak.hour).toISOString(),
                        count: peak.playerCount
                      }))}
                      width={graphWidth}
                      height={300}
                      graphColor="#82ca9d"
                    />
                  ) : (
                    <ErrorComponent height={300} />
                  )}
                </Card>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default GamingAnalytics;