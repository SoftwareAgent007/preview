import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import KeywordModal from "./addNewKeyword";

interface KeywordsListProps {
  activeKeywords: { id: bigint; keyword: string; createdAt: Date; active: boolean; guildId: bigint; }[];
}

const ActiveKeywordsList: React.FC<KeywordsListProps> = ({ activeKeywords }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddKeyword = () => {
    // Mock event for adding a keyword
    console.log("Keyword added!");
    closeModal();
  };

  return (
    <Card className="p-8"> {/* Increased padding */}
      <div className="flex flex-col">
      <div className="flex justify-left items-center mb-4">
        <h2 className="text-md font-bold mr-4 text-[#222]">Active Keywords</h2> {/* Darker text and smaller font size */}
        <Button className="p-2 bg-blue-500 text-white text-sm font-normal" onClick={openModal}>
          Add Keyword
        </Button>
      </div>
      
      <div className="keywords-container overflow-y-hidden">
        <div className="overflow-y-scroll max-h-80 flex flex-wrap gap-2 pr-2 pb-5">
          {activeKeywords.map((keyword) => (
            <Badge key={keyword.id.toString()} className="text-sm font-light text-blue-500 bg-blue-100 border p-[5px] px-[7px] m-1 rounded shadow">
              <span className="font-bold text-blue-600">{keyword.keyword}</span>
            </Badge>
          ))}
        </div>
        <div className="fade-shadow"></div>
      </div>
    </div>
      {isModalOpen && ReactDOM.createPortal(
        <KeywordModal 
          closeModal={closeModal} 
          handleAddKeyword={handleAddKeyword} 
        />,
        document.body
      )}
    </Card>
  );
};

export default ActiveKeywordsList;