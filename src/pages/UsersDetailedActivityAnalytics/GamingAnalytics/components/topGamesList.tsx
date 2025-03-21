import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PopularGame } from "@/types/dataTypes";
import ErrorComponent from "@/components/common/errorModel";

const colors = ["#4F46E5", "#F59E0B", "#10B981"];

interface TopGamesListProps {
  topGames: PopularGame[];
}

const TopGamesList = ({ topGames }: TopGamesListProps) => {
  const sortedGames = [...topGames]
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, 3);
  const maxHours = sortedGames[0]?.totalHours || 1;

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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full"
    >
      <Card className="p-6 h-full hover:scale-[101%] transition-all duration-150">
        <motion.h2
          className="title text-gray-500 text-lg font-bold mb-4"
          variants={itemVariants}
        >
          Top Games
        </motion.h2>
        <motion.ul className="space-y-3" variants={containerVariants}>
          {sortedGames.length > 0 ? (
            
            sortedGames.map((game, index) => (
              <motion.li
                key={index}
                className="flex flex-col"
                variants={itemVariants}
                whileHover={{ x: 5 }}
              >
                <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
                  <span>{game.gameName}</span>
                  <span>{game.totalHours} hrs</span>
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
          ) : (
            <ErrorComponent height={350} />
          )}
        </motion.ul>
      </Card>
    </motion.div>
  );
};

export default TopGamesList;
