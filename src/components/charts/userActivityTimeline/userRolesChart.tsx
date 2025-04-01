import { Card } from "@/components/ui/card";
import CircleRoleChart from "../circleChartOfRoles";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Expand, Minimize } from "lucide-react";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

const RolesChart = ({ width, data }: { width?: number, data: { roleName: string, count: number, percentage: number, color: string }[] }) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const [chartWidth, setChartWidth] = useState(width || 400);
    const [chartHeight, setChartHeight] = useState(300);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const MIN_CHART_SIZE = 300;
    const MAX_CHART_SIZE = 800;

    const updateChartDimensions = () => {
        if (chartRef.current) {
            const containerWidth = chartRef.current.offsetWidth;
            const containerHeight = chartRef.current.offsetHeight;
            
            // Calculate width based on container size
            const newWidth = Math.min(containerWidth - 48, 800); // 48px for padding
            const newHeight = Math.min(containerHeight - 100, 800); // 100px for header/margins

            setChartWidth(newWidth);
            setChartHeight(newHeight);
        }
    };

    useEffect(() => {
        updateChartDimensions();
        const resizeObserver = new ResizeObserver(updateChartDimensions);
        if (chartRef.current) {
            resizeObserver.observe(chartRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

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

    return (
        <>
            <Card className="w-full min-h-[500px] flex flex-col p-6 hover:scale-[101%] transition-all duration-150" ref={chartRef}>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="h-full flex flex-col"
                >
                    <motion.div 
                        className="text-gray-500 text-lg font-bold mb-4 flex justify-between items-center flex-wrap gap-2"
                        variants={itemVariants}
                    >
                        <motion.div 
                            className="title flex items-center gap-3"
                            variants={itemVariants}
                        >
                            <motion.span
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                            >
                                User Roles
                            </motion.span>
                            <ClickableTooltip content={
                                <motion.p
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <strong>User Roles diagram: </strong> 
                                    Roles chart shows the percentage of people with different roles online.
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
                            variants={itemVariants}
                        >
                            <Expand className="w-5 h-5 text-gray-500" />
                        </motion.button>
                    </motion.div>

                    <motion.div 
                        className="flex-grow flex flex-col items-center justify-center relative mt-auto"
                        variants={itemVariants}
                    >
                        <div className="relative flex items-center justify-center">
                            <CircleRoleChart 
                                width={chartWidth} 
                                height={chartHeight} 
                                data={data} 
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </Card>

            <AnimatePresence>
                {isModalOpen && (
                    <Modal 
                        closeModal={() => setIsModalOpen(false)} 
                        data={data}
                        width={chartWidth * 1.5}
                        height={chartHeight * 1.5}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

interface ModalProps {
    closeModal: () => void;
    data: any[];
    width: number;
    height: number;
}

const Modal: React.FC<ModalProps> = ({ closeModal, data, width, height }) => {
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
                            User Roles Distribution
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
                        <CircleRoleChart 
                            data={data} 
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

export default RolesChart;