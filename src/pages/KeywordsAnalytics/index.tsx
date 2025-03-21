import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import MessageFrequencyChart from "@/components/charts/keywordsMatches/keywordsMatchesTimeline";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { useKeywordsAnalytics } from "@/hooks/analytics/useKeywordsAnalytics";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import ActiveKeywordsList from "./components/keywordsList";
import KeywordStatCard from "./components/KeywordStatCard";
import ContentLoader from "react-content-loader";
import ErrorComponent from "@/components/common/errorModel";
import KeywordsTable from "./components/KeywordsTable";

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const KeywordsAnalytics = () => {
  // #region Hooks & State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    totalKeywords,
    activeKeywords,
    totalMatches,
    keywordsList,
    matchesTimeline,
    activeKeywordTags,
    pagination,
    isLoading,
    error
  } = useKeywordsAnalytics();
  
  const hasErrors = useMemo(() => Boolean(error), [error]);
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

  const isValidValue = (value: number | undefined): boolean => {
    return value !== undefined && value >= 0;
  };

  // #region Stats Cards Data
  const statsCardsData = [
    {
      index: 0,
      title: "Keywords",
      value: isValidValue(totalKeywords) ? totalKeywords : undefined,
      subValue: { label: "active", value: isValidValue(activeKeywords) ? activeKeywords : undefined },
      tooltipContent: "Total number of keywords in the system"
    },
    {
      index: 1,
      title: "Active Keywords",
      value: isValidValue(activeKeywords) ? activeKeywords : undefined,
      tooltipContent: "Currently active keywords"
    },
    {
      index: 2,
      title: "Total Matches",
      value: isValidValue(totalMatches) ? totalMatches : undefined,
      tooltipContent: "Total keyword matches found"
    }
  ];
  // #endregion

  return (
    <motion.div 
      className="w-full min-h-screen bg-gray-50 p-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        {/* #region Header */}
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.KEYWORD_ANALYTICS]} />
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
            statsCardsData.map((card) => (
              card.value !== undefined ? (
                <KeywordStatCard key={card.title} {...card} />
              ) : (
                <ErrorComponent key={card.title} />
              )
            ))
          )}
        </div>
        {/* #endregion */}

        {/* #region Charts & Active Keywords */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          variants={container}
        >
          <Card className="flex-1 p-6">
            {isLoading ? (
              <CardSkeleton width="100%" height="200px" />
            ) : (
              <MessageFrequencyChart matchesTimeline={matchesTimeline ?? []} />
            )}
          </Card>

          <Card className="flex-1 p-6">
            {isLoading ? (
              <CardSkeleton width="100%" height="200px" />
            ) : activeKeywordTags?.length > 0 ? (
              <ActiveKeywordsList activeKeywordTags={activeKeywordTags ?? []} keywordsList={keywordsList ?? []} />
            ) : (
              <ErrorComponent />
            )}
          </Card>
        </motion.div>
        {/* #endregion */}

        {/* #region Data Table */}
        <motion.div 
          className="w-full gap-6"
          variants={container}
        >
          <Card className="p-6 h-150">
            {isLoading ? (
              <CardSkeleton width="100%" height="200px" />
            ) : (
              <KeywordsTable />
            )}
          </Card>
        </motion.div>
        {/* #endregion */}
      </div>
    </motion.div>
  );
};

export default KeywordsAnalytics;
