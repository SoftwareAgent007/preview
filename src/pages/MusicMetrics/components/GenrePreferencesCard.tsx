import { motion } from "framer-motion";
import HorizontalBarChartRelatedGenres from "@/components/charts/music/musicActivityChart";
import { GenrePreferencesCardProps } from "../interfaces/music.interfaces";
import { useRef, useEffect, useState } from "react";

const GenrePreferencesCard = ({ data }: GenrePreferencesCardProps) => {
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
    <motion.div ref={containerRef} variants={item}>
      <HorizontalBarChartRelatedGenres
        data={data.slice(0, 5)}
        width={width}
        height={370}
      />
    </motion.div>
  );
};

export default GenrePreferencesCard;