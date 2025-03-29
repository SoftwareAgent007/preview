import AreaUserActivityLineChart from "@/components/charts/dashboard/AreaUserActivityLineChart";
import ErrorComponent from "@/components/common/errorModel";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, Loader2, Minimize } from "lucide-react";
import React, { useState, useContext, useEffect } from "react";
import ReactDOM from "react-dom";
import { DashboardContext } from '@/common/context/queryContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityTimelineProps {
    width?: number;
    isLoading?: boolean;
    activityTimeline: {
        date: string;
        activeUsers: number;
    }[];
    onViewTypeChange?: (viewType: ViewType) => void;
    title?: string;
    tooltipContent?: string;
}

type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
    width = 543,
    isLoading = false,
    activityTimeline = [],
    onViewTypeChange,
    title = "Active users",
    tooltipContent = ''
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { selectedPeriod } = useContext(DashboardContext);
    
    // Calculate default view type based on date range
    const getDefaultViewType = (): ViewType => {
        if (!selectedPeriod?.to || !selectedPeriod?.from) return 'daily';
        
        const diffDays = Math.abs(new Date(selectedPeriod.to).getTime() - new Date(selectedPeriod.from).getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays <= 30) return 'daily';
        if (diffDays <= 90) return 'weekly'; 
        if (diffDays <= 365) return 'monthly';
        return 'yearly';
    };

    const [viewType, setViewType] = useState<ViewType>(() => {
        const saved = localStorage.getItem('activity-timeline-view-type');
        return (saved as ViewType) || getDefaultViewType();
    });

    useEffect(() => {
        onViewTypeChange?.(viewType);
        localStorage.setItem('activity-timeline-view-type', viewType);
    }, [viewType]);

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
        <motion.div 
            className="flex flex-col"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div 
                className="text-gray-500 text-lg font-bold mb-4 flex justify-between items-center"
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
                        {title}
                    </motion.span>
                    <ClickableTooltip content={
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <strong>User Activity Timeline: </strong> 
                            {tooltipContent}
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
                    <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
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
                className="chart-parent flex justify-center items-center h-[300px]"
                variants={itemVariants}
            >
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                    >
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </motion.div>
                ) : activityTimeline?.length ? (
                    <AreaUserActivityLineChart
                        viewType={viewType}
                        data={activityTimeline}
                        width={width} 
                        height={300}
                    />
                ) : (
                    <ErrorComponent />
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <Modal 
                        closeModal={() => setIsModalOpen(false)} 
                        activityTimeline={activityTimeline} 
                        width={width} 
                        viewType={viewType}
                        isLoading={isLoading}
                        onViewTypeChange={setViewType}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface ModalProps {
    closeModal: () => void;
    activityTimeline: any;
    width: number;
    viewType: ViewType;
    onViewTypeChange: (value: ViewType) => void;
    isLoading: boolean;
}

const Modal: React.FC<ModalProps> = ({ closeModal, activityTimeline, width, viewType, onViewTypeChange, isLoading }) => {
    const handleOutsideClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest(".modal-content") === null) {
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
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" 
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
                    className="bg-white p-6 rounded-lg shadow-xl relative modal-content max-w-4xl w-full mx-4"
                    onClick={e => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-between items-center mb-6"
                    >
                        <div className="flex items-center gap-3">
                            <motion.h2 
                                className="text-gray-500 text-xl font-bold"
                                whileHover={{ x: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                Active Users
                            </motion.h2>
                            <Select value={viewType} onValueChange={onViewTypeChange}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
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
                        className="flex justify-center items-center"
                    >
                        
                        {isLoading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center"
                            >
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </motion.div>
                        ) : activityTimeline?.length ? (
                                <AreaUserActivityLineChart
                                    viewType={viewType}
                                    data={activityTimeline}
                                    width={width * 1.7}
                                    height={500}
                                />
                            ) : (
                                <ErrorComponent />
                            )}
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default ActivityTimeline;