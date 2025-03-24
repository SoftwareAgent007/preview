import KeywordsDataTableComponent from "@/components/common/KeywordsDataTable";
import ErrorComponent from "@/components/common/errorModel";
import { useKeywordsAnalytics } from "@/hooks/analytics/useKeywordsAnalytics";
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
  } = useKeywordsAnalytics(currentPage, pageSize);

  if (!keywordsList?.length && !isLoading) {
    return <ErrorComponent />;
  }

  return (
    <KeywordsDataTableComponent 
      onToggleActive={(keyword) => toggleKeywordActive.mutateAsync({id: String(keyword.id)})}
      onDelete={(keyword) => deleteKeyword.mutateAsync({id: String(keyword.id)})}
      displayedKeywords={keywordsList ?? []} 
      totalKeywords={keywordsList?.length ?? 0}
      searchTerm={searchTerm} 
      setSearchTerm={setSearchTerm} 
      currentPage={pagination?.currentPage || currentPage} 
      setCurrentPage={setCurrentPage} 
      totalPages={pagination?.totalPages || Math.ceil((keywordsList?.length ?? 0) / pageSize)}
      onPageSizeChange={setPageSize}
      pageSize={pagination?.itemsPerPage || pageSize}
      isLoading={isLoading}
    />
  );
};

export default KeywordsTable; 