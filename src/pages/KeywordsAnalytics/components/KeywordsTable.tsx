import KeywordsDataTableComponent from "@/components/common/KeywordsDataTable";
import ErrorComponent from "@/components/common/errorModel";
import { useKeywordsAnalytics, useKeywordTimeline } from "@/hooks/analytics/useKeywordsAnalytics";
import { useState } from "react";

const KeywordsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    keywordsList,
    pagination,
    isLoading,
    toggleKeywordActive,
    deleteKeyword,
  } = useKeywordsAnalytics(currentPage, pageSize, undefined, searchTerm);

  const { selectedKeywordTimeline = { keywords: [], totalCount: 0 } } = useKeywordTimeline(
    searchTerm || undefined
  );
  const { keywords: timelineKeywords, totalCount } = selectedKeywordTimeline;

  if (!keywordsList?.length && !isLoading && !searchTerm) {
    return <ErrorComponent />;
  }

  return (
    <KeywordsDataTableComponent
      onToggleActive={({keyword}) => toggleKeywordActive.mutateAsync({keyword})}
      onDelete={(id) => deleteKeyword.mutateAsync({id})}
      displayedKeywords={timelineKeywords ?? keywordsList ?? []}
      defaultKeywords={keywordsList ?? []}
      searchTerm={searchTerm} 
      setSearchTerm={setSearchTerm} 
      currentPage={pagination?.currentPage ?? currentPage} 
      setCurrentPage={setCurrentPage} 
      totalKeywords={totalCount ?? 0}
      totalPages={pagination?.totalPages ?? 1}
      onPageSizeChange={setPageSize}
      pageSize={pagination?.itemsPerPage ?? pageSize}
      isLoading={isLoading}
    />
  );
};

export default KeywordsTable; 