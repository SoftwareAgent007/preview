import PeakListeningHoursChart from "@/components/charts/music/peackHoursChart";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import ErrorComponent from "@/components/common/errorModel";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { useMusicData } from "@/hooks/analytics/useMusicMetrics";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { motion } from "framer-motion";
import ContentLoader from "react-content-loader";
import BaseCard from "./components/BaseCard";
import GenrePreferencesCard from "./components/GenrePreferencesCard";
import MusicStatCard from "./components/MusicStatCard";
import SessionStatsCard from "./components/SessionStatsCard";
import TopPlayedArtistsCard from "./components/TopPlayedArtistCard";

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const MusicMetrics = () => {
  const { overview, genres, topArtists, peakHours, avgSession, isLoading, error } = useMusicData("618826436299456533", "month");

  // #region Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };
  // #endregion

  if (error) {
    return <ErrorComponent />;
  }

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
        {/* #region Header */}
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BreadcrumbsNavigation
            items={BREADCRUMB_PATHS[ROUTES.MUSIC_METRICS]}
          />
        </motion.div>
        {/* #endregion */}

        {/* #region Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {isLoading ? (
            <>
              <Card className="p-6"><CardSkeleton width="100%" height="100px" /></Card>
              <Card className="p-6"><CardSkeleton width="100%" height="100px" /></Card>
              <Card className="p-6"><CardSkeleton width="100%" height="100px" /></Card>
            </>
          ) : (
            [
              { label: "Total Plays", value: overview.totalPlays.value, change: overview.totalPlays.change, isPositive: overview.totalPlays.change > 0 },
              { label: "Unique Artists", value: overview.uniqueArtists.value, change: overview.uniqueArtists.change, isPositive: overview.uniqueArtists.change > 0 },
              { label: "Active Listeners", value: overview.activeListeners.value, change: overview.activeListeners.change, isPositive: overview.activeListeners.change > 0 },
            ].map((stat, index) => (
              <MusicStatCard
                key={index}
                index={index}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                isPositive={stat.isPositive}
                tooltipContent={`Statistics for ${stat.label.toLowerCase()}`}
              />
            ))
          )}
        </div>
        {/* #endregion */}

        {/* #region Artists and Genres */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          variants={container}
        >
          {isLoading ? (
            <>
              <Card className="p-6"><CardSkeleton width="100%" height="200px" /></Card>
              <Card className="p-6"><CardSkeleton width="100%" height="200px" /></Card>
            </>
          ) : (
            <>
              {topArtists.length > 0 ? (
                <TopPlayedArtistsCard artists={topArtists} />
              ) : (
                <Card className="flex-1 p-6">
                  <span className="text-gray-500 text-lg font-bold mb-4">Top Played Artists</span>
                  <ErrorComponent height="90%" />
                </Card>
              )}
              
              {genres.length > 0 ? (
                <GenrePreferencesCard data={genres} />
              ) : (
                <Card className="flex-1 p-6">
                  <span className="text-gray-500 text-lg font-bold mb-4">Genre Preferences</span>
                  <ErrorComponent height="90%" />
                </Card>
              )}
            </>
          )}
        </motion.div>
        {/* #endregion */}

        {/* #region Charts */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={container}
        >
          {isLoading ? (
            <>
              <Card className="p-6"><CardSkeleton width="100%" height="200px" /></Card>
              <Card className="p-6"><CardSkeleton width="100%" height="200px" /></Card>
            </>
          ) : (
            <>
              <BaseCard>
                <div className="title">
                  <span className="text-gray-500 text-lg font-bold mr-5">Peak Listening Hours</span>
                  <ClickableTooltip content={<p><strong>Peak Listening Hours:</strong> Shows statistics for the most active hours of the day.</p>}>
                    <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
                  </ClickableTooltip>
                </div>
                {peakHours.hourlyDistribution.length > 0 ? (
                  <motion.div variants={item}>
                    <PeakListeningHoursChart data={peakHours.hourlyDistribution} />
                  </motion.div>
                ) : (
                  <ErrorComponent height="90%" />
                )}
              </BaseCard>
              
              {avgSession ? (
                <SessionStatsCard stats={avgSession} />
              ) : (
                <Card className="flex-1 p-6 flex flex-col items-center">
                  <span className="text-gray-500 text-lg font-bold mb-4">Average Listening Session</span>
                  <ErrorComponent height="90%" />
                </Card>
              )}
            </>
          )}
        </motion.div>
        {/* #endregion */}
      </div>
    </motion.div>
  );
};

export default MusicMetrics;