import { motion } from "framer-motion";
import BaseCard from "./BaseCard";
import HorizontalBarChartRelatedGenres from "@/components/charts/music/musicActivityChart";

interface GenrePreferencesCardProps {
  data: any[];
}

const GenrePreferencesCard = ({ data }: GenrePreferencesCardProps) => {
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0 
    }
  };

  return (
    <BaseCard>
      <motion.span
        className="text-gray-500 text-lg font-bold mb-4"
        variants={item}
      >
        Genre Preferences
      </motion.span>
      <motion.div variants={item}>
        <HorizontalBarChartRelatedGenres
          data={data.slice(0, 5)}
          width={500}
          height={370}
        />
      </motion.div>
    </BaseCard>
  );
};

export default GenrePreferencesCard;