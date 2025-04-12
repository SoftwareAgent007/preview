import UserActivityTimeline from "@/components/charts/userActivityTimeline/userActivityTimelineChartWrapper";
import RolesChart from "@/components/charts/userActivityTimeline/userRolesChart";
import ErrorComponent from "@/components/common/errorModel";
import { Card } from "@/components/ui/card";
import { useActivityTrend } from "@/hooks/analytics/useDashboardData";
import { useGameDetails, useGamingStats, useRolesDistribution, useAggregateStats } from "@/hooks/analytics/useGamingAnalytics";
import { usePeakHours } from "@/hooks/analytics/useGamingPeakHours";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ContentLoader from "react-content-loader";
import StatCard from "./components/StatCard";
import TopGamesList from "./components/topGamesList";
import SearchableSelect from "@/components/ui/searchebleSelect";

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

interface GameData {
  gameName: string;
  playerCount: number;
  percentage: number;
}

interface ProcessedGames {
  mainGames: GameData[];
  otherGames: GameData[];
  otherPercentage: number;
}

const GamingAnalytics = () => {
  const { currentlyPlayedGames, isLoading: statsLoading } = useGamingStats();
  const { aggregateStats, isLoading: aggregateLoading } = useAggregateStats();
  const [selectedGame, setSelectedGame] = useState<string>("");
  const { peakHours: gamePeakHours, isLoading: peakHoursLoading } = usePeakHours();
  const { rolesDistribution, isLoading: rolesLoading, error: rolesError } = useRolesDistribution();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [graphWidth, setGraphWidth] = useState(0);
  const { data: activityTrend, isLoading: trendLoading } = useActivityTrend('gaming', viewType);
  const [hoveredGame, setHoveredGame] = useState<GameData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { gameReport, isLoading: gameDetailsLoading } = useGameDetails(selectedGame && !trendLoading ? selectedGame : "");

  useEffect(() => {
    if (currentlyPlayedGames?.length > 0) {
      const mostPopular = currentlyPlayedGames.reduce((prev, current) => 
        (current.playerCount > prev.playerCount) ? current : prev
      );
      setSelectedGame(mostPopular.gameName);
    }
  }, [currentlyPlayedGames]);

  const [basicStats, setBasicStats] = useState({
    totalPlayers: 0,
    medianSessionMinutes: 0,
    peakPartySize: 0,
    totalHours: 0,
    returnRate: 0,
    peakHours: gamePeakHours || []
  });

  useEffect(() => {
    console.log('basicStats',basicStats)
  },[basicStats])
  useEffect(() => {
    if (gameReport) {
      setBasicStats({
        totalPlayers: gameReport.totalPlayers,
        medianSessionMinutes: gameReport.medianSessionMinutes,
        peakPartySize: gameReport.peakPartySize,
        totalHours: gameReport.totalHours,
        returnRate: gameReport.returnRate,
        peakHours: gameReport.peakHours
      });
    }
  }, [gameReport]);

  const updateGraphWidth = () => {
    if (wrapperRef.current && wrapperRef.current.offsetWidth > 910) {
      setGraphWidth(wrapperRef.current.offsetWidth * 0.8);
    } else if (wrapperRef.current) {
      setGraphWidth(wrapperRef.current.offsetWidth * 0.8);
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
        updateGraphWidth();
    });
    
    if (wrapperRef.current) {
        resizeObserver.observe(wrapperRef.current);
    }

    return () => resizeObserver.disconnect();
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

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    }
  };

  // Updated Stats Data with all available fields including returnRate
  const statsData = [
    { 
      title: "Peak Party Size", 
      value: basicStats?.peakPartySize.toLocaleString(), 
      subtitle: "In a single party",
      tooltip: "Maximum number of players in a single party"
    },
    { 
      title: "Total Players", 
      value: basicStats?.totalPlayers.toLocaleString(), 
      subtitle: "Lifetime Unique Players", 
      unit: "players",
      tooltip: "Total number of unique players who have played this game"
    },
    { 
      title: "Return Rate", 
      value: `${basicStats?.returnRate.toFixed(2).toLocaleString()}%`, 
      subtitle: "Daily Return Percentage", 
      unit: "%",
      tooltip: "How many players from the previous day returned to play the same game"
    },
    { 
      title: "Medium Session Duration", 
      value: Math.floor(basicStats?.medianSessionMinutes / 60) > 0 ? `${Math.floor(basicStats?.medianSessionMinutes / 60)}h ${basicStats?.medianSessionMinutes % 60}m` : `${basicStats.medianSessionMinutes % 60}m`, 
      subtitle: "In A Single Gaming Session", 
      tooltip: "Average time players spend in a single gaming session" 
    },
    { 
      title: "Total Game Time", 
      value: basicStats.totalHours.toLocaleString(), 
      subtitle: "Cumulative Hours Played", 
      unit: "hrs",
      tooltip: "Total cumulative hours spent playing this game"
    },
  ];

  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD",
    "#D4A5A5", "#9B9B9B", "#A8E6CF", "#DCEDC1", "#FFD3B6"
  ];

  const MIN_PERCENTAGE = 2;
  const processedGames = currentlyPlayedGames?.reduce<ProcessedGames>((acc, game) => {
    if (game.percentage >= MIN_PERCENTAGE) {
      acc.mainGames.push(game);
    } else {
      acc.otherPercentage += game.percentage;
      acc.otherGames.push(game);
    }
    return acc;
  }, { mainGames: [], otherGames: [], otherPercentage: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const statsCards = [
    {
      title: "Total Gaming Hours",
      value: aggregateStats?.totalGamingHours ?? 0,
      subtitle: "Across All Games",
      trend: aggregateStats?.totalGamingHoursChange ?? 0,
      isTrendPositive: (aggregateStats?.totalGamingHoursChange ?? 0) > 0,
      tooltip: "Total hours spent gaming across all games",
      index: 0
    },
    {
      title: "Avg Session Length",
      value: aggregateStats?.avgSessionMinutes ?? 0,
      subtitle: "Minutes per Session",
      trend: aggregateStats?.avgSessionMinutesChange ?? 0,
      isTrendPositive: (aggregateStats?.avgSessionMinutesChange ?? 0) > 0,
      tooltip: "Average length of gaming sessions in minutes",
      index: 1
    },
    {
      title: "Peak Players",
      value: aggregateStats?.peakConcurrentPlayers ?? 0,
      subtitle: "Concurrent Players",
      trend: aggregateStats?.peakConcurrentPlayersChange ?? 0,
      isTrendPositive: (aggregateStats?.peakConcurrentPlayersChange ?? 0) > 0,
      tooltip: "Highest number of concurrent players",
      index: 2
    },
    {
      title: "Unique Gamers",
      value: aggregateStats?.uniqueGamers ?? 0,
      subtitle: "Active Players",
      trend: 0,
      isTrendPositive: true,
      tooltip: "Total number of unique players",
      index: 3
    },
  ];

  return (
    <motion.div 
      ref={wrapperRef} 
      className="w-full bg-gray-50 p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onMouseMove={handleMouseMove}
    >
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        
        {/* Stats Cards */}
        <motion.div className="grid gap-4 md:gap-6 mb-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {aggregateLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="flex-1 p-6 h-[160px]">
                <CardSkeleton width="100%" height="120" />
              </Card>
            ))
          ) : (
            statsCards.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))
          )}
        </motion.div>

        {/* Game Selector */}
        <Card className="p-4 mb-6" style={{boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 5px 0px"}}>
          {statsLoading ? (
            <CardSkeleton width="100%" height="40" />
          ) : (
            <>
              <motion.span
                className="text-gray-500 text-lg font-medium mb-4 flex justify-between items-center"
                variants={itemVariants}
              >
                Selected Game  
              </motion.span>
              <SearchableSelect
                value={selectedGame}
                onChange={setSelectedGame}
                options={currentlyPlayedGames?.map(game => ({
                  value: game.gameName,
                  label: game.gameName
                })) || []}
                placeholder="Select a game"
                className="w-full"
              />
            </>
          )}
        </Card>

        {/* Stats Cards */}
        <motion.div className={`grid gap-4 md:gap-6 mb-6 ${
          graphWidth < 800 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
        }`}>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div 
            className="grid gap-6"
            variants={itemVariants}>
            <TopGamesList />
          </motion.div>

          {/* Roles Chart */}
          <motion.div variants={itemVariants}>
            {rolesLoading ? (
              <Card >
                <CardSkeleton width="100%" height="500" />
              </Card>
            ) : (
              <RolesChart width={500} data={rolesDistribution} />
            )}
          </motion.div>
        </div> 

        {/* Activity Timeline */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 h-[400px] hover:scale-[101%] transition-all duration-150">
            {trendLoading ? (
              <CardSkeleton width="100%" height="350" />
            ) : (activityTrend?.data || []).length > 0 ? (
              <UserActivityTimeline 
                title="User Playing Activity Timeline"
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

        {/* Games Distribution Bar */}
        <motion.div variants={itemVariants} className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Current Games Distribution</h3>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              {processedGames?.mainGames.map((game, index) => (
                <div
                  key={game.gameName}
                  className="absolute h-full flex items-center justify-center text-xs text-white font-medium transition-all duration-300 hover:brightness-90 cursor-pointer"
                  style={{
                    left: `${processedGames.mainGames.slice(0, index).reduce((acc, g) => acc + g.percentage, 0)}%`,
                    width: `${game.percentage}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                  onMouseEnter={() => setHoveredGame(game)}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  {game.percentage > 5 ? `${game.gameName} (${game.percentage.toFixed(1)}%)` : ''}
                </div>
              ))}
              {processedGames?.otherPercentage > 0 && (
                <div
                  className="absolute h-full right-0 bg-gray-400 flex items-center justify-center text-xs text-white font-medium transition-all duration-300 hover:brightness-90 cursor-pointer"
                  style={{
                    width: `${processedGames.otherPercentage}%`
                  }}
                  onMouseEnter={() => setHoveredGame({ 
                    gameName: 'Others', 
                    playerCount: processedGames.otherGames.reduce((acc, game) => acc + game.playerCount, 0),
                    percentage: processedGames.otherPercentage 
                  })}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  {processedGames.otherPercentage > 5 ? `Others (${processedGames.otherPercentage.toFixed(1)}%)` : ''}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {processedGames?.mainGames.map((game, index) => (
                <div 
                  key={game.gameName} 
                  className="flex items-center gap-2"
                  onMouseEnter={() => setHoveredGame(game)}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm">{game.gameName}</span>
                </div>
              ))}
              {processedGames?.otherPercentage > 0 && (
                <div 
                  className="flex items-center gap-2"
                  onMouseEnter={() => setHoveredGame({ 
                    gameName: 'Others', 
                    playerCount: processedGames.otherGames.reduce((acc, game) => acc + game.playerCount, 0),
                    percentage: processedGames.otherPercentage 
                  })}
                  onMouseLeave={() => setHoveredGame(null)}
                >
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm">Others</span>
                </div>
              )}
            </div>
            <AnimatePresence>
              {hoveredGame && (
                <motion.div
                  variants={tooltipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute bg-white text-black p-3 rounded-lg shadow-lg z-50 border border-gray-200"
                  style={{
                    left: mousePosition.x + 10,
                    top: mousePosition.y - 70,
                    pointerEvents: 'none'
                  }}
                >
                  <div className="font-semibold">{hoveredGame.gameName}</div>
                  <div>Players: {hoveredGame.playerCount.toLocaleString()}</div>
                  <div>Share: {hoveredGame.percentage.toFixed(1)}%</div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GamingAnalytics;
