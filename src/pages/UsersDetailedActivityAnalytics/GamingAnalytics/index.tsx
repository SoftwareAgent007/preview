import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChartWrapper";
import RolesChart from "@/components/charts/userActivityTimeline/userRolesChart";
import ErrorComponent from "@/components/common/errorModel";
import { Card } from "@/components/ui/card";
import { useActivityTrend } from "@/hooks/analytics/useDashboardData";
import { useGameDetails, useGamingStats, useRolesDistribution } from "@/hooks/analytics/useGamingAnalytics";
import { usePeakHours } from "@/hooks/analytics/useGamingPeakHours";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ContentLoader from "react-content-loader";
import StatCard from "./components/StatCard";
import TopGamesList from "./components/topGamesList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const GamingAnalytics = () => {
  const { popularGames, isLoading: statsLoading } = useGamingStats();
  const [selectedGame, setSelectedGame] = useState<string>("");
  const { gameReport, isLoading: gameDetailsLoading } = useGameDetails(selectedGame);
  const { peakHours: gamePeakHours, isLoading: peakHoursLoading } = usePeakHours();
  const { rolesDistribution, isLoading: rolesLoading, error: rolesError } = useRolesDistribution();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [graphWidth, setGraphWidth] = useState(0);
  const { data: activityTrend, isLoading: trendLoading } = useActivityTrend('gaming', viewType);

  useEffect(() => {
    if (popularGames?.length > 0) {
      const mostPopular = popularGames.reduce((prev, current) => 
        (current.totalHours > prev.totalHours) ? current : prev
      );
      setSelectedGame(mostPopular.gameName);
    }
  }, [popularGames]);

  const {
    basicStats: {
      totalPlayers = 0,
      avgSessionMinutes = 0,
      peakPartySize = 0,
      totalHours = 0,
      returnRate = 0,
      peakHours = gamePeakHours || []
    } = {},
    weeklyTrends = [],
    playtimeDistribution = [],
    topGamers = [],
    timeOfDayBreakdown = []
  } = gameReport || {};

  useEffect(() => {
    console.log('totalPlayers:', totalPlayers);
    console.log('avgSessionMinutes:', avgSessionMinutes); 
    console.log('peakPartySize:', peakPartySize);
    console.log('totalHours:', totalHours);
    console.log('returnRate:', returnRate);
    console.log('weeklyTrends:', weeklyTrends);
    console.log('peakHours:', peakHours);
    console.log('playtimeDistribution:', playtimeDistribution);
    console.log('topGamers:', topGamers);
    console.log('timeOfDayBreakdown:', timeOfDayBreakdown);
  }, [totalPlayers, avgSessionMinutes, peakPartySize, totalHours, returnRate, weeklyTrends, peakHours, playtimeDistribution, topGamers, timeOfDayBreakdown]);

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

  // Updated Stats Data with all available fields including returnRate
  const statsData = [
    // { 
    //   title: "Active Users", 
    //   value: totalPlayers.toLocaleString(), 
    //   subtitle: "Currently Online",
    //   tooltip: "Number of unique players who played this game in the selected time period"
    // },
    { 
      title: "Peak Party Size", 
      value: peakPartySize.toLocaleString(), 
      subtitle: "In a single party",
      tooltip: "Maximum number of players in a single party"
    },
    { 
      title: "Total Players", 
      value: totalPlayers.toLocaleString(), 
      subtitle: "Lifetime Unique Players", 
      unit: "players",
      tooltip: "Total number of unique players who have played this game"
    },
    { 
      title: "Return Rate", 
      value: returnRate.toLocaleString(), 
      subtitle: "Daily Return Percentage", 
      unit: "%",
      tooltip: "How many players from the previous day returned to play the same game"
    },
    { 
      title: "Avg. Session Time", 
      value: Math.floor(avgSessionMinutes / 60) > 0 ? `${Math.floor(avgSessionMinutes / 60)}h ${avgSessionMinutes % 60}m` : `${avgSessionMinutes % 60}m`, 
      subtitle: "Average Session Duration", 
      tooltip: "Average time players spend in a single gaming session" 
    },
    { 
      title: "Total Game Time", 
      value: totalHours.toLocaleString(), 
      subtitle: "Cumulative Hours Played", 
      unit: "hrs",
      tooltip: "Total cumulative hours spent playing this game"
    },
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
        {/* Game Selector */}
        
        <Card className="p-4 mb-6" style={{boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 5px 0px"}}>
          {statsLoading ? (
            <CardSkeleton width="100%" height="40" />
          ) : (
            <Select value={selectedGame} onValueChange={setSelectedGame}>
            <motion.span
            className="text-gray-500 text-lg font-medium mb-4 flex justify-between items-center"
                variants={itemVariants}
              >
              Selected Game  
            </motion.span>
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {popularGames?.map((game) => (
                  <SelectItem key={game.gameName} value={game.gameName}>
                    {game.gameName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Card>

        {/* Stats Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
          {gameDetailsLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="flex-1 p-6 h-[160px]">
                  <CardSkeleton width="100%" height="120" />
                </Card>
              ))}
            </>
          ) : (
            <>
              {statsData.slice(0, 5).map((stat, index) => (
                <StatCard height="140px" {...stat} index={index} />
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
            {/* Top Games List */}
            {statsLoading ? (
              <Card className="p-6">
                <CardSkeleton width="100%" height="500" />
              </Card>
            ) : (
              <TopGamesList topGames={popularGames} />
            )}

            {/* Activity Timeline */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 h-[400px]">
                {trendLoading ? (
                  <CardSkeleton width="100%" height="350" />
                ) : (activityTrend?.data || []).length > 0 ? (
                  <UserActivityTimeline 
                    title="User Activity Timeline"
                    activityTimeline={activityTrend?.data || []} 
                    width={graphWidth}
                    isLoading={trendLoading}
                    tooltipContent="Displays the number of users playing games across various time periods."
                    onViewTypeChange={setViewType}
                  />
                ) : (
                  <ErrorComponent height={300} />
                )}
              </Card>
            </motion.div>
          </motion.div>

          {/* Roles Chart */}
          <motion.div variants={itemVariants}>
            {rolesLoading ? (
              <Card className="p-6">
                <CardSkeleton width="100%" height="500" />
              </Card>
            ) : (
              <RolesChart width={500} data={rolesDistribution} />
            )}
          </motion.div>
        </div> 
      </div>
    </motion.div>
  );
};

export default GamingAnalytics;
