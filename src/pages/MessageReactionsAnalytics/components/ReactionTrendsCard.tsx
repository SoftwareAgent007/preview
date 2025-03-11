import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import BackToBackHistogram from "@/components/charts/reactions/reactionsBalanceChart";

interface ReactionTrendsCardProps {
  data: any[];
  width: number;
}

const ReactionTrendsCard = ({ data, width }: ReactionTrendsCardProps) => {
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
        damping: 30,
        delay: 0.2
      }}
    >
      <Card className="p-6 shadow-lg bg-white rounded-2xl hover:scale-[101%] transition-all duration-150">
        <motion.h3 
          className="text-gray-500 text-lg font-bold mb-1"
          variants={item}
        >
          Reaction Trends Over Time
        </motion.h3>
        <motion.p 
          className="text-gray-600 text-sm mb-4"
          variants={item}
        >
          Analyzing the fluctuations in user reactions.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <BackToBackHistogram data={data as never[]} width={width} />
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ReactionTrendsCard;