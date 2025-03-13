import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Expand, Minimize } from "lucide-react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const TopGamingStatuses: React.FC<{ 
  topStatusMessages: { status: string; usedBy: number; trend: "increasing" | "decreasing" | "stable"; }[] 
}> = ({ topStatusMessages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="p-6 pt-4 h-full hover:scale-[101%] transition-all duration-150">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="h-full flex flex-col"
        >
          <motion.div 
            className="text-gray-500 text-lg font-bold mb-4 cursor-pointer flex justify-between items-center"
            variants={itemVariants}
          >
            <motion.h3 
              className="text-lg font-bold"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Top Status Messages
            </motion.h3>
            <motion.button 
              onClick={() => setIsModalOpen(true)} 
              className="p-2 rounded-full"
              whileHover={{ 
                scale: 1.1,
                backgroundColor: "rgba(243, 244, 246, 1)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Expand className="text-gray-500" />
            </motion.button>
          </motion.div>
          <motion.ul className="space-y-4 flex-1">
            {topStatusMessages.slice(0, 6).map((message, index) => (
              <motion.li 
                key={index} 
                className="bg-gray-200 p-4 rounded-lg hover:bg-gray-300 transition-colors"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xl">{message.status}</span>
                  <span className={`text-sm ${message.trend === 'increasing' ? 'text-green-500' : message.trend === 'decreasing' ? 'text-red-500' : 'text-gray-500'}`}>
                    {message.trend === 'increasing' ? `+${Math.floor(Math.random() * 10) + 1}%` : message.trend === 'decreasing' ? `-${Math.floor(Math.random() * 10) + 1}%` : 'Stable'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">Used by {message.usedBy} members</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <Modal closeModal={() => setIsModalOpen(false)} topStatusMessages={topStatusMessages} />
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal: React.FC<{ closeModal: () => void; topStatusMessages: { status: string; usedBy: number; trend: "increasing" | "decreasing" | "stable"; }[] }> = ({ closeModal, topStatusMessages }) => {
  const handleOutsideClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('.modal-content') === null) {
      closeModal();
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.2,
        when: "beforeChildren"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        when: "afterChildren"
      }
    }
  };

  const modalVariants = {
    hidden: { 
      scale: 0.8,
      opacity: 0,
      y: 20
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.3
      }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    })
  };

  return ReactDOM.createPortal(
    <motion.div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" 
      onClick={handleOutsideClick}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        variants={modalVariants}
        className="w-1/2 h-[70vh] relative modal-content"
      >
        <Card className="bg-white p-6 h-full">
          <motion.div 
            className="flex justify-between items-center mb-4"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-gray-500 text-lg font-bold mb-4">Top Status Messages</h2>
            <motion.button 
              className="absolute top-6 right-6"
              onClick={closeModal}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Minimize className="text-gray-500" />
            </motion.button>
          </motion.div>
          <motion.ul 
            className="space-y-4 h-[90%] overflow-y-auto flex flex-col"
            initial="hidden"
            animate="visible"
          >
            {topStatusMessages.map((message, index) => (
              <motion.li 
                key={index} 
                custom={index}
                variants={listItemVariants}
                className="bg-gray-200 p-4 rounded-lg"
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "rgb(229, 231, 235)",
                  transition: { duration: 0.2 }
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xl font-medium">{message.status}</span>
                  <span className={`text-sm ${message.trend === 'increasing' ? 'text-green-500' : message.trend === 'decreasing' ? 'text-red-500' : 'text-gray-500'}`}>
                    {message.trend === 'increasing' ? `+${Math.floor(Math.random() * 10) + 1}%` : message.trend === 'decreasing' ? `-${Math.floor(Math.random() * 10) + 1}%` : 'Stable'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">Used by {message.usedBy} members</span>
              </motion.li>
            ))}
          </motion.ul>
        </Card>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default TopGamingStatuses;
