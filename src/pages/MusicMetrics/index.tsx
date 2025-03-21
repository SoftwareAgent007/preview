import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import PeakListeningHoursChart from "@/components/charts/music/peakHoursChart";
import { useState } from "react";
import MusicStatCard from "./components/MusicStatCard";
import { motion } from "framer-motion";
import {
  generateFakeArtists,
  generateSessionStats,
  generateFakeStats,
  generateFakeGenreData,
  generateListeningHoursData,
} from "./utils";
import GenrePreferencesCard from "./components/GenrePreferencesCard";
import SessionStatsCard from "./components/SessionStatsCard";
import TopPlayedArtistsCard from "./components/TopPlayedArtistCard";
import BaseCard from "./components/BaseCard";

const MusicMetrics = () => {
  // #region Data Generation
  const stats = generateFakeStats();
  const topArtists = generateFakeArtists();
  const genreData = generateFakeGenreData();
  const [sessionStats] = useState(generateSessionStats());
  // #endregion

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
          {stats.map((stat, index) => (
            <MusicStatCard
              key={index}
              index={index}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              isPositive={stat.isPositive}
              tooltipContent={`Statistics for ${stat.label.toLowerCase()}`}
            />
          ))}
        </div>
        {/* #endregion */}

        {/* #region Artists and Genres */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          variants={container}
        >
          <TopPlayedArtistsCard artists={topArtists} />
          <GenrePreferencesCard data={genreData} />
        </motion.div>
        {/* #endregion */}

        {/* #region Charts */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={container}
        >
          <BaseCard>
            <motion.div variants={item}>
              <PeakListeningHoursChart data={generateListeningHoursData()} />
            </motion.div>
          </BaseCard>
          <SessionStatsCard stats={sessionStats} />
        </motion.div>
        {/* #endregion */}
      </div>
    </motion.div>
  );
};

export default MusicMetrics;
