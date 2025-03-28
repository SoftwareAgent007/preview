import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import KeywordsMatchesTimeline from "@/components/charts/keywordsMatches/keywordsMatchesGraph";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { useKeywordsAnalytics, useKeywordTrend } from "@/hooks/analytics/useKeywordsAnalytics";
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
  const [matchesChartWidth, setMatchesChartWidth] = useState(0);
  const [searchKeywordTerm, setSelectedKeywordTerm] = useState<string>("");
  const matchesChartRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewType, setViewType] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30); // Default to day view
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  });

  const updateGraphWidth = () => {
    if (matchesChartRef.current) {
      console.log('matchesChartRef.current.offsetWidth', matchesChartRef.current.offsetWidth);
      setMatchesChartWidth(matchesChartRef.current.offsetWidth); // Subtract padding
    }
  };

  useEffect(() => {
    if (matchesChartRef.current) {
      updateGraphWidth();
    }
  }, [matchesChartRef.current]);

  useEffect(() => {
    window.addEventListener("resize", updateGraphWidth);
    return () => window.removeEventListener("resize", updateGraphWidth);
  }, []);

  const updateDateRange = (viewType: 'day' | 'week' | 'month' | 'year') => {
    const start = new Date().setFullYear(new Date().getFullYear() - 1);;
    const end = new Date();
    
    // switch(viewType) {
    //   case 'day':
    //     start.setDate(end.getDate() - 30);
    //     break;
    //   case 'week':
    //     start.setDate(end.getDate() - 90);
    //     break;
    //   case 'month':
    //     start.setDate(end.getDate() - 365);
    //     break;
    //   case 'year':
    //     start.setFullYear(end.getFullYear() - 1);
    //     break;
    // }

    setDateRange({
      start: start.toString(),
      end: end.toString()
    });
  };

  useEffect(() => {
    updateDateRange(viewType);
    console.log('viewType, dateRange.start, dateRange.end',viewType, dateRange.start, dateRange.end);  
  }, [viewType]);

  const {
    totalKeywords,
    activeKeywords,
    totalMatches,
    keywordsList,
    activeKeywordTags,
    pagination,
    isLoading,
    error
  } = useKeywordsAnalytics(currentPage, pageSize);
  
  const { matchesTimeline } = useKeywordsAnalytics(currentPage, pageSize);

  const { trendData, isTrendLoading } = useKeywordTrend(searchKeywordTerm, viewType, 10);

  const hasErrors = useMemo(() => Boolean(error), [error]);

  useEffect(() => {
    if (keywordsList?.length) {
      const mostPopular = keywordsList.reduce((prev, current) => 
        (prev.matches?.count ?? 0) > (current.matches?.count ?? 0) ? prev : current
      );
      setSelectedKeywordTerm(mostPopular.keyword);
    }
  }, [keywordsList]);

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

  // #region Stats Cards Data
  const statsCardsData = [
    {
      index: 0,
      title: "Keywords",
      value: totalKeywords || 0,
      subValue: { label: "Active", value: activeKeywords || 0 },
      tooltipContent: "Total number of keywords in the system"
    },
    {
      index: 1,
      title: "Active Keywords",
      value: activeKeywords || 0,
      tooltipContent: "Currently active keywords"
    },
    {
      index: 2,
      title: "Total Matches",
      value: totalMatches || 0,
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
              <KeywordStatCard key={card.title} {...card} />
            ))
          )}
        </div>
        {/* #endregion */}

        {/* #region Charts & Active Keywords */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          variants={container}
        >
          <Card ref={matchesChartRef} className="flex-1 p-6">
            {isLoading ? (
              <CardSkeleton width="100%" height="200px" />
            ) : (
              <KeywordsMatchesTimeline 
                onViewTypeChange={setViewType}
                keywords={keywordsList?.map(keyword => keyword.keyword) || []}
                matchesTimeline={searchKeywordTerm ? trendData : []}
                onSearch={setSelectedKeywordTerm}
                width={matchesChartWidth}
                selectedKeyword={searchKeywordTerm}
              />
            )}
          </Card>

          <Card className="flex-1 p-6">
            {isLoading ? (
              <CardSkeleton width="100%" height="200px" />
            ) : (activeKeywordTags || []).length > 0 ? (
              <ActiveKeywordsList 
                activeKeywordTags={activeKeywordTags || []} 
                keywordsList={keywordsList || []} 
              />
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
