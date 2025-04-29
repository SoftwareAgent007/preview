import ErrorComponent from "@/components/common/errorModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGamingStats } from "@/hooks/analytics/useGamingAnalytics";
import { PopularGame } from "@/types/dataTypes";
import { AnimatePresence, motion } from "framer-motion";
import { Expand } from "lucide-react";
import { useState } from "react";
import ReactDOM from "react-dom";

const colors = ["#4F46E5", "#F59E0B", "#10B981"];

interface ModalProps {
  closeModal: () => void;
  popularGames: PopularGame[];
  pagination: { popularGames: { total: number } };
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
}

const Modal = ({ 
  closeModal, 
  popularGames, 
  pagination, 
  isLoading, 
  currentPage, 
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages 
}: ModalProps) => {
  const modalRoot = document.getElementById('modal-root') || document.body;
  const maxHours = popularGames?.[0]?.totalHours || 1;

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={closeModal}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Top Games</h2>
            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <Expand className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {popularGames?.map((game, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
                  <span>{game.gameName}</span>
                  <span>{game.totalHours.toLocaleString()} hrs</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(game.totalHours / maxHours) * 100}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="flex items-center px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    modalRoot
  );
};

const TopGamesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { popularGames, pagination, isLoading, error } = useGamingStats({
    page: currentPage,
    limit: pageSize,
  });

  const totalPages = Math.ceil((pagination.popularGames.total || 0) / pageSize);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const maxHours = popularGames?.[0]?.totalHours || 1;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full"
    >
      <Card className="p-6 h-full hover:scale-[101%] transition-all duration-150">
        <div className="flex justify-between items-center mb-4">
          <motion.h2
            className="title text-gray-500 text-lg font-bold"
            variants={itemVariants}
          >
            Top Games
          </motion.h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Expand className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <motion.ul className="space-y-3" variants={containerVariants}>
          {isLoading ? (
            [...Array(9)].map((_, i) => (
              <motion.li key={i} className="flex flex-col" variants={itemVariants}>
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
                <div className="h-2 rounded-full bg-gray-200 animate-pulse" />
              </motion.li>
            ))
          ) : error ? (
            <ErrorComponent height={350} />
          ) : (
            popularGames?.map((game, index) => (
              <motion.li
                key={index}
                className="flex flex-col"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
                  <span>{game.gameName}</span>
                  <span>{game.totalHours.toLocaleString()} hrs</span>
                </div>
                <motion.div
                  className="h-2 rounded-full bg-gray-200"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <motion.div
                    className="h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(game.totalHours / maxHours) * 100}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      delay: 0.5 + index * 0.1,
                    }}
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                </motion.div>
              </motion.li>
            ))
          )}
        </motion.ul>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <Modal
            closeModal={() => setIsModalOpen(false)}
            popularGames={popularGames}
            pagination={pagination}
            isLoading={isLoading}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TopGamesList;
