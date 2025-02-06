import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import ReactDOM from "react-dom";

interface KeywordsListProps {
  activeKeywords: { id: bigint; keyword: string; createdAt: Date; active: boolean; guildId: bigint; }[];
}

const KeywordsList: React.FC<KeywordsListProps> = ({ activeKeywords }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAddKeyword = () => {
    // Mock event for adding a keyword
    console.log("Keyword added!");
    closeModal();
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-bold mb-4">Keywords List</h2>
        <div className="grid grid-cols-5 gap-4">
          {activeKeywords.map((keyword) => (
            <Badge key={keyword.id.toString()} className="bg-blue-100 border p-4 rounded shadow">
              <span className="font-bold">{keyword.keyword}</span>
            </Badge>
          ))}
        </div>
        <Button className="mt-4 p-2 bg-blue-500 rounded" onClick={openModal}>Add Keyword</Button>
      </div>
      {isModalOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded">
            <h2 className="text-lg font-bold mb-4">Add New Keyword</h2>
            <input type="text" placeholder="Enter keyword" className="border p-2 mb-4 w-full" />
            <div className="flex justify-end">
              <Button className="mr-2" onClick={closeModal}>Cancel</Button>
              <Button className="bg-blue-500" onClick={handleAddKeyword}>Add</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Card>
  );
};

export default KeywordsList;
