import MessageFrequencyChart from "@/components/charts/userActivityTimeline/messageFrequencyChart";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import TrendIndicator from "@/components/common/TrendIndicator";
import { Card } from "@/components/ui/card";
import { useKeywordsAnalytics } from "@/hooks/analytics/useKeywordsAnalytics";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { useState } from "react";
import KeywordsList from "./components/keywordsList";
import DataTableComponent from "@/components/common/DataTable";

const KeywordsAnalytics = () => {
  const {
    activeKeywords,
    keywordStats,
    totalActiveKeywords,
    totalMatches,
    matchesTimeline,
  } = useKeywordsAnalytics();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredKeywords = activeKeywords.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredKeywords.length / itemsPerPage);
  const displayedKeywords = filteredKeywords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <div className="flex justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.KEYWORD_ANALYTICS]} />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <Card className="p-6 р-50">
            <div className="h-full flex flex-col justify-between">
              <span className="text-gray-500 text-sm font-medium">Keywords</span>
              <div className="flex-1 flex items-center">
                <span className="text-2xl font-bold">{keywordStats.total}</span>
              </div>
              <div className="text-sm text-gray-500 flex-row justify-between">
                <span>{keywordStats.active} active</span>
                <TrendIndicator unit={'%'} value={5} isPositive={true} />
              </div>
            </div>
          </Card>
          <Card className="p-6 р-50">
            <div className="h-full flex flex-col justify-between">
              <span className="text-gray-500 text-sm font-medium">Active Keywords</span>
              <div className="flex-1 flex items-center">
                <span className="text-2xl font-bold">{keywordStats.active}</span>
              </div>
              <TrendIndicator unit={'%'} value={5} isPositive={true} />
            </div>
          </Card>
          <Card className="p-6 р-50">
            <div className="h-full flex flex-col justify-between">
              <span className="text-gray-500 text-sm font-medium">Total Matches</span>
              <div className="flex-1 flex items-center">
                <span className="text-2xl font-bold">{totalMatches}</span>
              </div>
              <TrendIndicator unit={'%'} value={5} isPositive={true} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <Card className="flex-1 p-6">
              <MessageFrequencyChart />
          </Card>
          
          <KeywordsList activeKeywords={activeKeywords} />
        </div>

        <div className="w-full gap-6">
          <Card className="p-6 h-150">
            <DataTableComponent 
              displayedKeywords={displayedKeywords} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              totalPages={totalPages} 
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KeywordsAnalytics;
