import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { mockData, negativePercentage, neutralPercentage, positivePercentage } from "./constant";
import ReactionOverviewCard from "./components/ReactionOverviewCard";
import ReactionTrendsCard from "./components/ReactionTrendsCard";

const MessageReactionsAnalytics = () => {
  // #region Refs and State
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [graphWidth, setGraphWidth] = useState(0);
  // #endregion

  // #region Effects
  useEffect(() => {
    const updateGraphWidth = () => {
      if (wrapperRef.current) {
        setGraphWidth(wrapperRef.current.offsetWidth - 40);
      }
    };

    window.addEventListener("resize", updateGraphWidth);
    updateGraphWidth();

    return () => window.removeEventListener("resize", updateGraphWidth);
  }, []);
  // #endregion

  // #region Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  // #endregion

  return (
    <motion.div 
      className="w-full min-h-screen bg-gray-100 p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div
        ref={wrapperRef}
        className="mx-auto max-w-[1200px] space-y-6"
      >
        {/* #region Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BreadcrumbsNavigation
            items={BREADCRUMB_PATHS[ROUTES.MESSAGE_REACTIONS]}
          />
        </motion.div>
        {/* #endregion */}

        {/* #region Overview Card */}
        <ReactionOverviewCard
          positivePercentage={positivePercentage}
          neutralPercentage={neutralPercentage}
          negativePercentage={negativePercentage}
        />
        {/* #endregion */}

        {/* #region Trends Card */}
        <ReactionTrendsCard 
          data={mockData}
          width={graphWidth}
        />
        {/* #endregion */}
      </motion.div>
    </motion.div>
  );
};

export default MessageReactionsAnalytics;