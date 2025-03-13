import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MultiLayerAreaChart from "../combinedAreaChart";
import { DataSet } from "@/components/common/types/userAnalytic.types";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Expand, Minimize } from "lucide-react";
import { ClickableTooltip } from "@/components/ui/tooltip";
import ErrorComponent from "@/components/common/errorModel";
import { motion, AnimatePresence } from "framer-motion";

const ActivityCharts = ({ data, className }: { data: DataSet; className?: string }) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const [chartWidth, setChartWidth] = useState(800);
    const [chartHeight, setChartHeight] = useState(300);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateChartDimensions = () => {
        if (chartRef.current) {
            const containerWidth = chartRef.current.offsetWidth;
            
            // Responsive sizing based on container and screen size
            if (window.innerWidth < 640) { // Mobile
                setChartWidth(containerWidth);
                setChartHeight(250);
            } else if (window.innerWidth < 1024) { // Tablet
                setChartWidth(containerWidth);
                setChartHeight(300);
            } else { // Desktop
                setChartWidth(containerWidth);
                setChartHeight(300);
            }
        }
    };

    useEffect(() => {
        updateChartDimensions();
        window.addEventListener("resize", updateChartDimensions);
        return () => window.removeEventListener("resize", updateChartDimensions);
    }, []);

    // #region Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        }
    };
    // #endregion

    return (
        <>
            <Card className={`w-full max-w-[1200px] hover:scale-[101%] transition-all duration-150 ${className}`}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <CardHeader>
                        <CardTitle>
                            <motion.div 
                                className="flex justify-between items-center"
                                variants={itemVariants}
                            >
                                <motion.div 
                                    className="title flex items-center gap-3"
                                    variants={itemVariants}
                                >
                                    <motion.span
                                        className="text-gray-500 text-lg font-bold"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        User Activity Overview
                                    </motion.span>
                                    <ClickableTooltip content={
                                        <motion.p
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <strong>Activity Overview: </strong>
                                            Shows the ratio of online users to users actively playing games within a given timeframe.
                                        </motion.p>
                                    }>
                                        <motion.span 
                                            className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                                            whileHover={{ 
                                                scale: 1.1,
                                                backgroundColor: "rgba(209, 213, 219, 0.4)"
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            ?
                                        </motion.span>
                                    </ClickableTooltip>
                                </motion.div>
                                <motion.button
                                    whileHover={{ 
                                        scale: 1.1,
                                        backgroundColor: "rgba(243, 244, 246, 1)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsModalOpen(true)}
                                    className="p-2 rounded-full transition-colors"
                                >
                                    <Expand className="w-5 h-5 text-gray-500" />
                                </motion.button>
                            </motion.div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent ref={chartRef}>
                        <motion.div 
                            className="space-y-4"
                            variants={itemVariants}
                        >
                            <motion.div 
                                className="flex flex-wrap gap-4 mb-2"
                                variants={itemVariants}
                            >
                                {Object.keys(data).length ? Object.entries(data).map(([key, value]) => (
                                    <motion.div 
                                        key={key} 
                                        className="flex items-center gap-2"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                            <div 
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: value.color }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium">
                                            {key}
                                        </span>
                                    </motion.div>
                                )) : <></>}
                            </motion.div>
                            {Object.keys(data).length
                                ? <motion.div variants={itemVariants}>
                                    <MultiLayerAreaChart 
                                        datasets={data} 
                                        width={chartWidth} 
                                        height={chartHeight} 
                                    />
                                  </motion.div>
                                : <ErrorComponent />
                            }
                        </motion.div>
                    </CardContent>
                </motion.div>
            </Card>

            <AnimatePresence>
                {isModalOpen && (
                    <Modal 
                        closeModal={() => setIsModalOpen(false)} 
                        datasets={data} 
                        width={chartWidth * 1.2} 
                        height={400} 
                    />
                )}
            </AnimatePresence>
        </>
    );
};

interface ModalProps {
    closeModal: () => void;
    datasets: DataSet;
    width: number;
    height: number;
}

const Modal: React.FC<ModalProps> = ({ closeModal, datasets, width, height }) => {
    const handleOutsideClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    };

    return ReactDOM.createPortal(
        <AnimatePresence mode="wait">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" 
                onClick={handleOutsideClick}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                    }}
                    className="bg-white p-6 rounded-lg shadow-xl relative modal-content max-w-4xl w-full"
                    onClick={e => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-between items-center mb-6"
                    >
                        <motion.h2 
                            className="text-gray-500 text-xl font-bold"
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            User Activity Overview
                        </motion.h2>
                        <motion.button
                            whileHover={{ 
                                scale: 1.1,
                                backgroundColor: "rgba(243, 244, 246, 1)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={closeModal}
                            className="p-2 rounded-full"
                        >
                            <Minimize className="text-gray-500 w-5 h-5" />
                        </motion.button>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center"
                    >
                        <MultiLayerAreaChart 
                            datasets={datasets} 
                            width={width} 
                            height={height}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default ActivityCharts;