import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Expand, Minimize, ArrowUp } from "lucide-react";
import { usePopularTracks } from "@/hooks/analytics/useMusicMetrics";
import ErrorComponent from "@/components/common/errorModel";
import ReactDOM from "react-dom";
import { PopularTrack } from "@/types/music.interface";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
const colors = ["#4F46E5", "#F59E0B", "#10B981"];

interface ModalProps {
  closeModal: () => void;
  tracks: PopularTrack[];
  isLoading: boolean;
}
const Modal = ({ closeModal }: ModalProps) => {
  const modalRoot = document.getElementById('modal-root') || document.body;
  const [displayCount, setDisplayCount] = useState(5);
  const { popularTracks: modalTracks, isLoading: modalLoading } = usePopularTracks(displayCount);
  const maxPlays = modalTracks?.[0]?._count.songName || 1;
  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      setShowScrollButton(containerRef.current.scrollTop > 100);
    }
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={closeModal}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <motion.div className="p-6 relative">
          <motion.div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Top Tracks</h2>

            <motion.div className="flex items-center gap-4">
              <Select 
                value={displayCount.toString()}
                onValueChange={(value) => setDisplayCount(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Tracks</SelectItem>
                  <SelectItem value="10">10 Tracks</SelectItem>
                  <SelectItem value="20">20 Tracks</SelectItem>
                  <SelectItem value="50">50 Tracks</SelectItem>
                </SelectContent>
              </Select>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <Minimize className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>

          <div ref={containerRef} className="space-y-6 max-h-[60vh] overflow-y-auto modal-scroll-container relative">
            <motion.div
              className="relative"
            >
              {modalLoading && !modalTracks?.length ? (
                Array(displayCount).fill(0).map((_, i) => (
                  <div key={i} className="flex flex-col mb-8 mr-6 p-4 transition-colors bg-gray-50 animate-pulse">
                    <div className="flex justify-between text-sm font-semibold text-gray-800 mb-2">
                      <div className="h-5 bg-gray-200 rounded w-48"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200"></div>
                  </div>
                ))
              ) : (
                modalTracks?.map((track, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col mb-6 mr-6 p-4 transition-colors bg-gray-50"
                  >
                    <div className="flex justify-between text-sm font-semibold text-gray-800 mb-2">
                      <span className="text-base">{track.songName}</span>
                      <span>{track._count.songName} plays</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span>Artist: {track.artist}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(track._count.songName / maxPlays) * 100}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </motion.div>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={scrollToTop}
                className="sticky bottom-6 m-0 left-[calc(100%-3rem)] p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-20"
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>,
    modalRoot
  );
};

interface TopTracksListProps {
  tracks: PopularTrack[];
  isLoading: boolean;
  error?: any;
}

const TopTracksList = ({ tracks, isLoading, error }: TopTracksListProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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

  const maxPlays = tracks?.[0]?._count.songName || 1;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-500 text-lg font-bold">Top Tracks</span>
        
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded-full"
          >
            <Expand className="w-4 h-4 text-gray-500" />
          </button>
      </div>

      <motion.ul className="space-y-3" variants={containerVariants}>
        {isLoading ? (
          [...Array(5)].map((_, i) => (
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
          tracks.map((track, index) => (
            <motion.li
              key={index}
              className="flex flex-col"
              variants={itemVariants}
            >
              <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
                <span>{track.songName}</span>
                <span>{track._count.songName} plays</span>
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
                  animate={{ width: `${(track._count.songName / maxPlays) * 100}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: 0.5 + index * 0.1
                  }}
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
              </motion.div>
            </motion.li>
          ))
        )}
      </motion.ul>

      <AnimatePresence>
        {isModalOpen && (
          <Modal
            closeModal={() => setIsModalOpen(false)}
            tracks={tracks}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TopTracksList;