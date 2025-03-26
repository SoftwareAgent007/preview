import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KeywordModal from "./addNewKeyword";
import { KeywordListItemDto } from "@/types/dataTypes";
import { X, Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useKeywordsAnalytics } from "@/hooks/analytics/useKeywordsAnalytics";
import { useDashboardContext } from "@/common/context/queryContext";

const ActiveKeywordsList = () => {
  const { guildId } = useDashboardContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [localKeywords, setLocalKeywords] = useState<KeywordListItemDto[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    keywordsList = [],
    activeKeywords,
    isLoading,
    addKeyword,
    toggleKeywordActive,
    pagination
  } = useKeywordsAnalytics(page, 40, guildId);

  useEffect(() => {
    if (keywordsList.length) {
      setLocalKeywords(prev => {
        const newKeywords = keywordsList.filter(
          newKey => !prev.some(existingKey => existingKey.id === newKey.id) && newKey.active
        );
        return [...prev, ...newKeywords];
      });
      
      // If we got less items than requested, there are no more
      if (keywordsList.length < 40) {
        setHasMore(false);
      }
      setIsLoadingMore(false);
    }
  }, [keywordsList]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 50; // pixels from bottom
    const scrolledToBottom = scrollHeight - scrollTop - clientHeight < threshold;

    if (scrolledToBottom) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [isLoading, isLoadingMore, hasMore]);

  useEffect(() => {
    const currentContainer = containerRef.current;
    if (currentContainer) {
      currentContainer.addEventListener('scroll', handleScroll);
      return () => currentContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleAddKeyword = async (keyword: string) => {
    try {
      await addKeyword.mutateAsync({ keyword, guildId });
      setIsModalOpen(false);
      toast.success('Keyword added successfully');
    } catch (error) {
      toast.error('Failed to add keyword');
    }
  };

  const handleToggleActive = async (keyword: KeywordListItemDto) => {
    try {
      setLocalKeywords(prev => prev.filter(k => k.id !== keyword.id));
      await toggleKeywordActive.mutateAsync({ keyword: keyword.keyword });
      toast.success('Keyword removed');
    } catch (error) {
      setLocalKeywords(prev => [...prev, keyword]);
      toast.error('Failed to remove keyword');
    }
  };

  return (
    <div className="p-4">
      <motion.div 
        className="flex flex-col"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="flex justify-between items-center mb-4"
          variants={item}
        >
          <div className="text-gray-500 text-lg font-bold mb-4">
            <span>Active Keywords ({activeKeywords})</span>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className="p-2 bg-blue-500 text-white text-sm font-normal" 
              onClick={() => setIsModalOpen(true)}
            >
              Add Keyword
            </Button>
          </motion.div>
        </motion.div>
      
        <motion.div 
          className="keywords-container overflow-y-hidden"
          variants={item}
        >
          <div 
            ref={containerRef}
            className="overflow-y-scroll max-h-80 flex flex-wrap gap-2 pr-2 pb-5"
          >
            <AnimatePresence mode="popLayout">
              {localKeywords.map((keyword) => (
                <motion.div
                  key={keyword.id}
                  variants={item}
                  layout
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge 
                    className="group flex items-center gap-2 text-sm font-light bg-blue-100 text-blue-500 border p-[5px] px-[7px] m-1 rounded shadow"
                  >
                    <span className="font-bold text-blue-600">
                      {keyword.keyword}
                    </span>
                    <button 
                      onClick={() => handleToggleActive(keyword)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Badge>
                </motion.div>
              ))}
              <div className="flex items-center justify-center w-full p-4">
                {isLoadingMore && (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                )}
                {!hasMore && !isLoadingMore && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <MoreHorizontal className="w-10 h-10" />
                  </div>
                )}
              </div>
            </AnimatePresence>
          </div>
          <div className="fade-shadow" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <KeywordModal 
            closeModal={() => setIsModalOpen(false)} 
            handleAddKeyword={handleAddKeyword} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveKeywordsList;