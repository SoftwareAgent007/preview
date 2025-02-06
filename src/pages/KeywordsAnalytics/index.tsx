import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { useKeywordsAnalytics } from "@/hooks/analytics/useKeywordsAnalytics";
import { useState } from "react";
import TrendIndicator from "@/components/common/TrendIndicator";
import MessageFrequencyChart from "@/components/charts/userActivityTimeline/messageFrequencyChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import KeywordsList from "./components/keywordsList";

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
            <div className="flex flex-col">
              <h2 className="text-lg font-bold mb-4">Keywords List</h2>
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 p-2 border border-gray-300 rounded"
              />
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2">Keyword</th>
                    <th className="border border-gray-300 p-2">Volume</th>
                    <th className="border border-gray-300 p-2">Active Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedKeywords.map((keyword) => (
                    <tr key={keyword.id}>
                      <td className="border border-gray-300 p-2">{keyword.keyword}</td>
                      <td className="border border-gray-300 p-2">{keyword.volume}</td>
                      <td className="border border-gray-300 p-2">
                        <button className="text-red-500">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-300 rounded"
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-300 rounded"
                >
                  Next
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KeywordsAnalytics;
