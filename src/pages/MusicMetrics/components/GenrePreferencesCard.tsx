import { motion } from "framer-motion";
import HorizontalBarChartRelatedGenres from "@/components/charts/music/musicActivityChart";
import { GenrePreferencesCardProps } from "../interfaces/music.interfaces";

const GenrePreferencesCard = ({ data }: GenrePreferencesCardProps) => {
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0 
    }
  };

  return (
    <motion.div variants={item}>
      <HorizontalBarChartRelatedGenres
        data={data.slice(0, 5)}
        width={500}
        height={370}
      />
    </motion.div>
  );
};

export default GenrePreferencesCard;