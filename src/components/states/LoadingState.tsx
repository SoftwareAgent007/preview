import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const LoadingState = ({ 
  text = "Loading...", 
  size = "md",
  fullScreen = false 
}: LoadingStateProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm" 
    : "w-full";

  return (
    <div className={`${containerClasses} flex items-center justify-center min-h-[200px] z-50`}>
      <motion.div 
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Loader2 className={`text-primary ${sizeClasses[size]}`} />
        </motion.div>
        {text && (
          <motion.span 
            className="text-muted-foreground text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingState;