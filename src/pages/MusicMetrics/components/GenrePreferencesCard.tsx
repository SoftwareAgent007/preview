import { motion } from "framer-motion";
import HorizontalBarChartRelatedGenres from "@/components/charts/music/musicActivityChart";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useRef, useEffect, useState } from "react";
import BaseCard from "./BaseCard";

interface GenrePreferencesCardProps {
  data: any[];
}

const GenrePreferencesCard = ({ data }: GenrePreferencesCardProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0 
    }
  };

  return (
    <BaseCard>
      <motion.div
        className="flex items-center gap-2 mb-2"
        variants={item}
      >
        <h3 className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Genre Preferences
        </h3>
        <ClickableTooltip content="Shows user genre preferences based on listening history">
          <Info className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </ClickableTooltip>
      </motion.div>
      
      <motion.div 
        ref={containerRef}
        variants={item}
        className="h-[350px] w-full"
      >
        <HorizontalBarChartRelatedGenres
          data={data.slice(0, 7)}
          darkMode={isDarkMode}
          width={width}
        />
      </motion.div>
    </BaseCard>
  );
};

export default GenrePreferencesCard;