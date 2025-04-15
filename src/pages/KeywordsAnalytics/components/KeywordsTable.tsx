import KeywordsDataTableComponent from "@/components/common/KeywordsDataTable";
import ErrorComponent from "@/components/common/errorModel";
import { useKeywordsAnalytics, useKeywordTimeline } from "@/hooks/analytics/useKeywordsAnalytics";
import { useState } from "react";
import { toast } from "sonner";
import { KeywordListItemDto } from "@/types/dataTypes";

const KeywordsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingKeywords, setLoadingKeywords] = useState<Record<string, boolean>>({});
  const [optimisticKeywords, setOptimisticKeywords] = useState<Record<string, boolean>>({});

  const {
    keywordsList,
    pagination,
    totalKeywords,
    isLoading,
    toggleKeywordActive,
    deleteKeyword,
  } = useKeywordsAnalytics(currentPage, pageSize, undefined, searchTerm);

  const { selectedKeywordTimeline = { keywords: [], totalCount: 0 }, isLoading: isTimelineLoading } = useKeywordTimeline(
    searchTerm || undefined
  );
  const { keywords: timelineKeywords, totalCount: searchMatchesCount } = selectedKeywordTimeline;

  const handleToggleActive = async (keyword: KeywordListItemDto) => {
    try {
      // Set loading state for this keyword
      setLoadingKeywords(prev => ({ ...prev, [keyword.keyword]: true }));
      // Set optimistic state
      setOptimisticKeywords(prev => ({ ...prev, [keyword.keyword]: !keyword.active }));

      await toggleKeywordActive.mutateAsync({ keyword: keyword.keyword });
      
      // Only clear loading state after success, keep the optimistic state
      setLoadingKeywords(prev => ({ ...prev, [keyword.keyword]: false }));
      
      toast.success(`Keyword "${keyword.keyword}" ${keyword.active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticKeywords(prev => {
        const newState = { ...prev };
        delete newState[keyword.keyword];
        return newState;
      });
      setLoadingKeywords(prev => ({ ...prev, [keyword.keyword]: false }));
      toast.error(`Failed to ${keyword.active ? 'deactivate' : 'activate'} keyword "${keyword.keyword}"`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoadingKeywords(prev => ({ ...prev, [id]: true }));
      await deleteKeyword.mutateAsync({ id });
      setLoadingKeywords(prev => ({ ...prev, [id]: false }));
      toast.success("Keyword deleted successfully");
    } catch (error) {
      setLoadingKeywords(prev => ({ ...prev, [id]: false }));
      toast.error("Failed to delete keyword");
    }
  };

  if (!keywordsList?.length && !isLoading && !searchTerm) {
    return <ErrorComponent />;
  }

  const getKeywordState = (keyword: KeywordListItemDto) => {
    return {
      isLoading: loadingKeywords[keyword.keyword] || false,
      active: optimisticKeywords[keyword.keyword] ?? keyword.active
    };
  };

  return (
    <>
      <KeywordsDataTableComponent
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        displayedKeywords={timelineKeywords ?? keywordsList ?? []}
        defaultKeywords={keywordsList ?? []}
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        currentPage={pagination?.currentPage ?? currentPage} 
        setCurrentPage={setCurrentPage} 
        totalKeywords={searchMatchesCount || totalKeywords || 0}
        totalPages={searchTerm ? 1 : pagination?.totalPages ?? 1}
        onPageSizeChange={setPageSize}
        pageSize={pagination?.itemsPerPage ?? pageSize}
        isLoading={isLoading || isTimelineLoading}
        getKeywordState={getKeywordState}
      />
    </>
  );
};

export default KeywordsTable; 