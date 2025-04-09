import AreaLineChart from "@/components/charts/AreaLineChart";
import ErrorComponent from "@/components/common/errorModel";
import { DashboardContext } from "@/common/context/queryContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useKeywordTrend } from "@/hooks/analytics/useKeywordsAnalytics";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { KeywordTrendDataPoint, TimelineDataDto } from "@/types/dataTypes";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, Loader2, Minimize, Search } from "lucide-react";
import React, { useCallback, useState, useContext, useEffect } from "react";
import ReactDOM from "react-dom";
import AreaUserActivityLineChart from "./AreaKeywordActivityLineChart";

type ViewType = "day" | "week" | "month" | "year";

interface MessageFrequencyChartProps {
    matchesTimeline: TimelineDataDto[] | KeywordTrendDataPoint[];
    width?: number;
    onSearch?: (term: string) => void;
    keywords?: string[];
    isLoading?: boolean;
    onViewTypeChange?: (viewType: ViewType) => void;
    selectedKeyword?: string;
}

const transformTrendData = (data: any[]): TimelineDataDto[] => {
    return data.map((item) => ({
        date: item.date,
        count: item.value,
    }));
};

const transformMatchesTimeline = (data: TimelineDataDto[] | KeywordTrendDataPoint[]): TimelineDataDto[] => {
    return data.map((item) => ({
        date: item.date,
        count: 'messageCount' in item ? item.messageCount : item.count,
    }));
};

const KeywordsMatchesTimeline: React.FC<MessageFrequencyChartProps> = ({
    matchesTimeline,
    width = 543,
    onSearch,
    keywords = [],
    isLoading: externalLoading = false,
    onViewTypeChange,
    selectedKeyword,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { selectedPeriod } = useContext(DashboardContext);

    const [viewType, setViewType] = useState<ViewType>("day");

    const { trendData, isTrendLoading } = useKeywordTrend(
        selectedKeyword,
        viewType === "day" ? "day" : viewType === "week" ? "week" : "month",
        viewType === "year" ? 12 : 7
    );

    const isLoading = isTrendLoading || externalLoading;
    const displayData = transformMatchesTimeline(matchesTimeline);

    useEffect(() => {
        if (selectedKeyword) {
            setSearchTerm(selectedKeyword);
        }
    }, [selectedKeyword]);

    useEffect(() => {
        onViewTypeChange?.(viewType);
    }, [viewType]);

    const handleSearch = useCallback(
        (value: string) => {
            setSearchTerm(value);
            onSearch?.(value);
        },
        [onSearch]
    );

    const handleSelect = useCallback(
        (value: string) => {
            setSearchTerm(value);
            onSearch?.(value);
        },
        [onSearch]
    );

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
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
                    className="title flex items-center mr-2 gap-3"
                    variants={itemVariants}
                >
                    <motion.span
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                    >
                        Matches Timeline
                    </motion.span>
                    <ClickableTooltip
                        content={
                            <motion.p
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <strong>Matches Timeline: </strong>
                                Displays the number of keyword matches over time
                                for a selected team board.
                            </motion.p>
                        }
                    >
                        <motion.span
                            className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                            whileHover={{
                                scale: 1.1,
                                backgroundColor: "rgba(209, 213, 219, 0.4)",
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ?
                        </motion.span>
                    </ClickableTooltip>
                    <Select
                        value={viewType}
                        onValueChange={(value: ViewType) => setViewType(value)}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>
                <motion.div className="flex items-center gap-4">
                    <Command className="rounded-lg border shadow-sm">
                        <CommandInput
                            value={searchTerm}
                            onValueChange={handleSearch}
                            placeholder="Search keywords..."
                            className="h-9"
                        />
                    </Command>
                    <motion.button
                        whileHover={{
                            scale: 1.1,
                            backgroundColor: "rgba(243, 244, 246, 1)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 rounded-full transition-colors"
                        variants={itemVariants}
                    >
                        <Expand className="w-5 h-5 text-gray-500" />
                    </motion.button>
                </motion.div>
            </motion.div>
            <motion.div
                className="chart-parent flex justify-between"
                variants={itemVariants}
            >
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center w-full h-[300px]"
                    >
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </motion.div>
                ) : displayData?.length ? (
                    <AreaUserActivityLineChart
                        data={displayData}
                        width={width}
                        height={300}
                        graphColor="#b1c4f5"
                    />
                ) : (
                    <ErrorComponent
                        height={300}
                        message="Not enough data points"
                    />
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <Modal
                        closeModal={() => setIsModalOpen(false)}
                        messageFrequency={displayData}
                        width={width}
                        viewType={viewType}
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
    viewType?: ViewType;
}

const Modal: React.FC<ModalProps> = ({
    closeModal,
    messageFrequency,
    width,
    viewType = "day",
}) => {
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
                        damping: 25,
                    }}
                    className="bg-white p-6 rounded-lg shadow-xl relative modal-content max-w-4xl w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
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
                            Message Activity
                        </motion.h2>
                        <motion.button
                            whileHover={{
                                scale: 1.1,
                                backgroundColor: "rgba(243, 244, 246, 1)",
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
                    >
                        {messageFrequency?.length ? (
                            <AreaUserActivityLineChart
                                data={messageFrequency}
                                width={width * 1.5}
                                height={500}
                                graphColor="#b1c4f5"
                            />
                        ) : (
                            <ErrorComponent
                                height={500}
                                message="Not enough data points"
                            />
                        )}
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default KeywordsMatchesTimeline;
