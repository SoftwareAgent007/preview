import { motion } from "framer-motion";
import { Users } from "lucide-react";
import ListElement from "@/components/ui/list-element";
import BaseCard from "./BaseCard";

interface Artist {
  name: string;
  plays: number;
}

interface TopPlayedArtistsCardProps {
  artists: Artist[];
}

const TopPlayedArtistsCard = ({ artists }: TopPlayedArtistsCardProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <BaseCard>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.span
          className="text-gray-500 text-lg font-bold mb-4"
          variants={item}
        >
          Top Played Artists
        </motion.span>
        {artists.map((artist, index) => (
          <motion.div
            key={index}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ListElement
              logo={<Users className="w-8 h-8 text-gray-600" />}
              title={artist.name}
              description={`${artist.plays} plays`}
              backgroundColor=""
            />
          </motion.div>
        ))}
      </motion.div>
    </BaseCard>
  );
};

export default TopPlayedArtistsCard;