import MessageFrequencyChart from "@/components/charts/keywordsMatches/keywordsMatchesTimeline";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import TrendIndicator from "@/components/common/TrendIndicator";
import { Card } from "@/components/ui/card";
import { useKeywordsAnalytics } from "@/hooks/analytics/useKeywordsAnalytics";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { useState } from "react";
import KeywordsList from "./components/keywordsList";
import DataTableComponent from "@/components/common/KeywordsDataTable";
import ActiveKeywordsList from "./components/keywordsList";
import { motion } from "framer-motion";
import KeywordStatCard from "./components/KeywordStatCard";

const KeywordsAnalytics = () => {
  // #region Hooks & State
  const {
    activeKeywords,
    keywordStats,
    totalActiveKeywords,
    totalMatches,
    matchesTimeline,
  } = useKeywordsAnalytics();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const itemsPerPage = 5;
  // #endregion

  // #region Data Processing
  const filteredKeywords = activeKeywords.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredKeywords.length / itemsPerPage);
  const displayedKeywords = filteredKeywords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
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

  // #region Stats Cards Data
  const statsCardsData = [
    {
      index: 0,
      title: "Keywords",
      value: keywordStats.total,
      subValue: { label: "active", value: keywordStats.active },
      trend: { value: 5, isPositive: true },
      tooltipContent: "Total number of keywords in the system"
    },
    {
      index: 1,
      title: "Active Keywords",
      value: keywordStats.active,
      trend: { value: 5, isPositive: true },
      tooltipContent: "Currently active keywords"
    },
    {
      index: 2,
      title: "Total Matches",
      value: totalMatches,
      trend: { value: 5, isPositive: true },
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
          {statsCardsData.map(card => (
            <KeywordStatCard key={card.index} {...card} />
          ))}
        </div>
        {/* #endregion */}

        {/* #region Charts & Active Keywords */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          variants={container}
        >
          <Card className="flex-1 p-6">
            <MessageFrequencyChart />
          </Card>
          
          <ActiveKeywordsList activeKeywords={activeKeywords} />
        </motion.div>
        {/* #endregion */}

        {/* #region Data Table */}
        <motion.div 
          className="w-full gap-6"
          variants={container}
        >
          <Card className="p-6 h-150">
            <DataTableComponent 
              displayedKeywords={displayedKeywords} 
              totalKeywords={activeKeywords.length}
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              totalPages={totalPages}
              onPageSizeChange={setPageSize}
              pageSize={pageSize}
            />
          </Card>
        </motion.div>
        {/* #endregion */}
      </div>
    </motion.div>
  );
};

export default KeywordsAnalytics;
