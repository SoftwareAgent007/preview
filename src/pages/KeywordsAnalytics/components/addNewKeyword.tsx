import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Spinner from '@/components/common/LoadingSpinner';
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { useKeywordTimeline } from '@/hooks/analytics/useKeywordsAnalytics';

const existingKeywords = ['react', 'typescript', 'javascript'];

const KeywordModal: React.FC<{
  closeModal: () => void;
  handleAddKeyword: (keyword: string) => void;
}> = ({ closeModal, handleAddKeyword }) => {
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isValidKeyword, setIsValidKeyword] = useState(false);
  const [availableMessage, setAvailableMessage] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const { selectedKeywordTimeline, isLoading: isTimelineLoading } = useKeywordTimeline(searchKeyword);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const checkKeywordExists = (value: string): boolean => {
    const normalizedValue = value.toLowerCase();
    return selectedKeywordTimeline?.keywords.some(keyword => 
      keyword.keyword.toLowerCase() === normalizedValue
    ) ?? false;
  };

  const validateKeyword = (value: string): boolean => {
    if (value.trim() === '') {
      setError('Keyword cannot be empty');
      setIsValidKeyword(false);
      setAvailableMessage('');
      return false;
    }

    if (value.length < 2) {
      setError('Keyword must be at least 2 characters long');
      setIsValidKeyword(false);
      setAvailableMessage('');
      return false;
    }

    if (checkKeywordExists(value)) {
      const existingKeyword = selectedKeywordTimeline?.keywords.find(
        k => k.keyword.toLowerCase() === value.toLowerCase()
      );
      setError(`Keyword already exists as "${existingKeyword?.keyword}"`);
      setIsValidKeyword(false);
      setAvailableMessage('');
      return false;
    }

    setError('');
    setIsValidKeyword(true);
    setAvailableMessage('Available to add');
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    setLoading(true);
    
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      if (value) {
        setSearchKeyword(value.toLowerCase());
      } else {
        setError('');
        setIsValidKeyword(false);
        setAvailableMessage('');
        setSearchKeyword('');
      }
      setLoading(false);
    }, 500);

    setDebounceTimeout(timeout);
  };

  React.useEffect(() => {
    if (!isTimelineLoading && searchKeyword) {
      validateKeyword(searchKeyword);
    }
  }, [isTimelineLoading, searchKeyword]);

  const handleSubmit = () => {
    if (validateKeyword(keyword)) {
      handleAddKeyword(keyword);
      closeModal();
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
        onClick={handleOutsideClick}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          <motion.h2 
            className="text-2xl font-semibold mb-6 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Add New Keyword
          </motion.h2>
          
          <motion.div 
            className={`${isValidKeyword && loading ? "mb-[0.84rem]" : "mb-6"} mt-0`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.input
              type="text"
              value={keyword}
              onChange={handleInputChange}
              placeholder="Enter keyword"
              className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
            <AnimatePresence mode="wait">
              {error ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm mt-2"
                >
                  {error}
                </motion.p>
              ) : availableMessage && !loading && isValidKeyword ? (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-green-500 text-sm mt-2"
                >
                  {availableMessage}
                </motion.p>
              ) : (
                (loading || isTimelineLoading) ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Spinner />
                  </motion.div>
                ) : <div className="h-7" />
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="flex justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="secondary"
                className="mr-2" 
                onClick={closeModal}
              >
                Cancel
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="default"
                onClick={handleSubmit}
                disabled={!!error || !keyword || loading || isTimelineLoading}
              >
                Add
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default KeywordModal;