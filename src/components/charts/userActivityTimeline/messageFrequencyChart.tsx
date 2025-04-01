import AreaLineChart from "@/components/charts/AreaLineChart";
import ErrorComponent from "@/components/common/errorModel";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { TimelineDataDto } from "@/types/dataTypes";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, Loader2, Minimize } from "lucide-react";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import AreaMessageActivityLineChart from "../dashboard/AreaMessageActivityLineChart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface MessageMetric {
  date: string;
  matchCount: number;
}

interface MessageFrequencyChartProps {
    messageFrequency?: MessageMetric[];
    width?: number;
    onViewTypeChange?: (viewType: ViewType) => void;
    isLoading?: boolean;
}

type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';

const MessageFrequencyChart: React.FC<MessageFrequencyChartProps> = ({
    messageFrequency = [],
    width = 543,
    onViewTypeChange,
    isLoading = false,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getDefaultViewType = (): ViewType => {
        if (!messageFrequency.length) return 'daily';
        
        const firstDate = new Date(messageFrequency[0].date);
        const lastDate = new Date(messageFrequency[messageFrequency.length - 1].date);
        const diffDays = Math.abs(lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays <= 30) return 'daily';
        if (diffDays <= 90) return 'weekly';
        if (diffDays <= 365) return 'monthly';
        return 'yearly';
    };

    const [viewType, setViewType] = useState<ViewType>(() => {
        const saved = localStorage.getItem('message-frequency-view-type');
        return (saved as ViewType) || getDefaultViewType();
    });

    useEffect(() => {
        onViewTypeChange?.(viewType);
        localStorage.setItem('message-frequency-view-type', viewType);
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

    const transformData = (messageFrequency: MessageMetric[]): TimelineDataDto[] => {
        return messageFrequency.map(metric => ({
            date: metric.date,
            count: metric.matchCount
        }));
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
                        Message Frequency
                    </motion.span>
                    <ClickableTooltip content={
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <strong>Message Frequency: </strong> 
                            Shows the frequency of messages sent by all members during a certain time in the guild. When the time frame changes, the data is updated.
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
                            <SelectValue placeholder="Select view" />
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
                ) : messageFrequency?.length ? (
                    <AreaMessageActivityLineChart
                        data={transformData(messageFrequency)}
                        width={width} 
                        height={300}
                        graphColor="#b1c4f5"
                    />
                ) : (
                    <ErrorComponent />
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <Modal 
                        closeModal={() => setIsModalOpen(false)} 
                        messageFrequency={transformData(messageFrequency)} 
                        width={width}
                        viewType={viewType}
                        onViewTypeChange={setViewType}
                        isLoading={isLoading}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface ModalProps {
    closeModal: () => void;
    messageFrequency: TimelineDataDto[];
    width: number;
    viewType: ViewType;
    onViewTypeChange: (value: ViewType) => void;
    isLoading: boolean;
}

const Modal: React.FC<ModalProps> = ({ closeModal, messageFrequency, width, viewType, onViewTypeChange, isLoading }) => {
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
                                Message Frequency
                            </motion.h2>
                            <Select value={viewType} onValueChange={onViewTypeChange}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Select view" />
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
                        ) : messageFrequency?.length ? (
                            <AreaMessageActivityLineChart
                                data={messageFrequency}
                                width={width * 1.5}
                                height={500}
                                graphColor="#b1c4f5"
                            />
                        ) : (
                            <ErrorComponent height={500}/>
                        )}
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default MessageFrequencyChart;