import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import LoadingText from '@/components/common/LoadingText';

const existingKeywords = ['react', 'typescript', 'javascript'];

const KeywordModal: React.FC<{
  closeModal: () => void;
  handleAddKeyword: (keyword: string) => void;
}> = ({ closeModal, handleAddKeyword }) => {
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isValidKeyword, setIsValidKeyword] = useState(false); // New state for keyword validity

  const checkKeywordExists = (value: string): boolean => {
    return existingKeywords.includes(value.toLowerCase());
  };

  const validateKeyword = (value: string): boolean => {
    if (value.trim() === '') {
      setError('Keyword cannot be empty');
      setIsValidKeyword(false);
      return false;
    }

    if (value.length < 2) {
      setError('Keyword must be at least 2 characters long');
      setIsValidKeyword(false);
      return false;
    }

    if (checkKeywordExists(value)) {
      setError('This keyword already exists');
      setIsValidKeyword(false);
      return false;
    }

    setError('');
    setIsValidKeyword(true); // Set valid keyword state
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Start loading when checking for existing keywords
    setLoading(true);
    const timeout = setTimeout(() => {
      if (value) {
        validateKeyword(value);
      } else {
        setError('');
        setIsValidKeyword(false); // Reset validity if input is empty
      }
      setLoading(false);
    }, 500); // Increased debounce time for checking existence

    setDebounceTimeout(timeout);
  };

  const handleSubmit = () => {
    if (validateKeyword(keyword)) {
      handleAddKeyword(keyword);
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">Add New Keyword</h2>
        
        <div className="mb-6">
          <input
            type="text"
            value={keyword}
            onChange={handleInputChange}
            placeholder="Enter keyword"
            className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error ? (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          ): (
            isValidKeyword && loading ? <LoadingText /> : <div className="h-7" />
          )}
        </div>

        <div className="flex justify-between">
          <Button 
            variant="secondary"
            className="mr-2" 
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button 
            variant="default"
            onClick={handleSubmit}
            disabled={!!error || !keyword}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KeywordModal;