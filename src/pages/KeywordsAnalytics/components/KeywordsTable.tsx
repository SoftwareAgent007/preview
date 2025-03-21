import { useState } from "react";
import { useKeywordsAnalytics } from "@/hooks/analytics/useKeywordsAnalytics";
import DataTableComponent from "@/components/common/KeywordsDataTable";
import ErrorComponent from "@/components/common/errorModel";
import { Loader2 } from "lucide-react";

const KeywordsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    keywordsList,
    pagination,
    isLoading,
  } = useKeywordsAnalytics(currentPage, pageSize);

  if (!keywordsList?.length && !isLoading) {
    return <ErrorComponent />;
  }

  return (
    <DataTableComponent 
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