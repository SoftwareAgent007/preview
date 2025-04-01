import { motion } from "framer-motion";
import { Users } from "lucide-react";
import ListElement from "@/components/ui/list-element";
import BaseCard from "./BaseCard";
import ErrorComponent from "@/components/common/errorModel";
import { ClickableTooltip } from "@/components/ui/tooltip";

interface Artist {
  id: string;
  name: string;
  spotifyId: string | null;
  genres: string[];
  createdAt: any;
  updatedAt: any;
}

interface TopArtist {
  artist: Artist;
  plays: number;
}

interface TopPlayedArtistsCardProps {
  artists: TopArtist[];
}

const TopPlayedArtistsCard = ({ artists }: TopPlayedArtistsCardProps) => {
  const container = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
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
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <motion.div className="flex items-center gap-2" variants={item}>
            <motion.span className="text-gray-500 text-lg font-bold">
              Top Played Artists
            </motion.span>
            <ClickableTooltip content={
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-[200px]"
              >
                <strong>Top Played Artists:</strong> Shows the artists with the most plays in the selected time period.
              </motion.p>
            }>
              <motion.span
                className="bg-gray-100 text-gray-600 px-[7px] rounded-full cursor-help"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "rgba(209, 213, 219, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                ?
              </motion.span>
            </ClickableTooltip>
          </motion.div>
        </div>

        {artists ? (
          <div className="space-y-3">
            {artists.map((artist, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ scale: 1.02, translateX: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`transition-all ${index % 2 !== 1 ? 'bg-gray-50' : ''}`}
              >
                <ListElement
                  logo={
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                  }
                  title={artist?.artist?.name}
                  description={`${artist?.plays.toLocaleString()} plays`}
                  backgroundColor={index % 2 !== 1 ? 'hover:bg-gray-100' : 'hover:bg-gray-50'}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <ErrorComponent />
        )}
      </motion.div>
    </BaseCard>
  );
};

export default TopPlayedArtistsCard;