import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import KeywordModal from "./addNewKeyword";

interface KeywordsListProps {
  activeKeywords: { 
    id: bigint; 
    keyword: string; 
    createdAt: Date; 
    active: boolean; 
    guildId: bigint; 
  }[];
}

const ActiveKeywordsList: React.FC<KeywordsListProps> = ({ activeKeywords }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    }
  };

  return (
    <Card className="p-4">
      <motion.div 
        className="flex flex-col"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          className="flex justify-left items-center mb-4"
          variants={item}
        >
          <div className="text-gray-500 text-lg font-bold mb-4 cursor-pointer mr-4">
            <span>Active Keywords</span>
          </div>
          <motion.div
            whileHover={{ 
              scale: 1.05,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
            whileTap={{ 
              scale: 0.95,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
              }
            }}
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
          <div className="overflow-y-scroll max-h-80 flex flex-wrap gap-2 pr-2 pb-5">
            <AnimatePresence>
              {activeKeywords.map((keyword) => (
                <motion.div
                  key={keyword.id.toString()}
                  variants={item}
                  layout
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge 
                    className="text-sm font-light text-blue-500 bg-blue-100 border p-[5px] px-[7px] m-1 rounded shadow"
                  >
                    <span className="font-bold text-blue-600">
                      {keyword.keyword}
                    </span>
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="fade-shadow" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <KeywordModal 
            closeModal={() => setIsModalOpen(false)} 
            handleAddKeyword={(keyword: string) => {
              console.log("Keyword added:", keyword);
              setIsModalOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ActiveKeywordsList;