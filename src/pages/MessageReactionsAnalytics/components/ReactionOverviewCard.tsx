import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import ReactionStatItem from "./ReactionStatItem";

interface ReactionOverviewCardProps {
  positivePercentage: string;
  neutralPercentage: string;
  negativePercentage: string;
}

const ReactionOverviewCard = ({
  positivePercentage,
  neutralPercentage,
  negativePercentage,
}: ReactionOverviewCardProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <Card className="p-6 shadow-lg bg-white rounded-2xl hover:scale-[101%] transition-all duration-150">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.h2 
            className="text-gray-500 text-lg font-bold mb-1"
            variants={item}
          >
            Message Reactions Overview
          </motion.h2>
          <motion.p 
            className="text-gray-600 text-sm mt-1"
            variants={item}
          >
            A breakdown of message reactions over time.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-center mt-6 md:px-40 gap-4"
            variants={container}
          >
            <ReactionStatItem 
              percentage={positivePercentage}
              label="Positive"
              color="green"
              index={0}
            />
            <motion.div 
              className="border-l border-gray-300 h-12 mx-4"
              variants={item}
            />
            <ReactionStatItem 
              percentage={neutralPercentage}
              label="Neutral"
              color="yellow"
              index={1}
            />
            <motion.div 
              className="border-l border-gray-300 h-12 mx-4"
              variants={item}
            />
            <ReactionStatItem 
              percentage={negativePercentage}
              label="Negative"
              color="red"
              index={2}
            />
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ReactionOverviewCard;