import AreaLineChart from "@/components/charts/AreaLineChart";
import ErrorComponent from "@/components/common/errorModel";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { TimelineDataDto } from "@/types/dataTypes";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, Minimize, Search } from "lucide-react";
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";

interface MessageFrequencyChartProps {
    matchesTimeline: TimelineDataDto[]
    width?: number;
    onSearch?: (term: string) => void;
    keywords?: string[];
}

const KeywordsMatchesTimeline: React.FC<MessageFrequencyChartProps> = ({ 
    matchesTimeline, 
    width = 543, 
    onSearch,
    keywords = [] 
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        onSearch?.(value);

        // Update suggestions based on input
        if (value) {
            const matches = keywords.filter(keyword => 
                keyword.toLowerCase().startsWith(value.toLowerCase())
            );
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    }, [keywords, onSearch]);

    const handleSelect = useCallback((value: string) => {
        setSearchTerm(value);
        onSearch?.(value);
        setSuggestions([]);
    }, [onSearch]);

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
                    className="title flex items-center mr-2 gap-3"
                    variants={itemVariants}
                >
                    <motion.span
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                    >
                        Matches Timeline
                    </motion.span>
                    <ClickableTooltip content={
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <strong>Matches Timeline: </strong>
                            Displays the number of keyword matches over time for a selected team board.
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
                <motion.div className="flex items-center gap-4">
                    <Command className="rounded-lg border shadow-md">
                        <CommandInput
                            value={searchTerm}
                            onValueChange={handleSearch}
                            placeholder="Search keywords..."
                            className="h-9"
                        />
                        {suggestions.length > 0 && (
                            <CommandList className="max-h-[200px] overflow-y-auto">
                                <CommandEmpty>No matching keywords found.</CommandEmpty>
                                <CommandGroup heading="Matching Keywords">
                                    {suggestions.map((keyword) => (
                                        <CommandItem
                                            key={keyword}
                                            value={keyword}
                                            onSelect={handleSelect}
                                            className="cursor-pointer hover:bg-blue-50"
                                        >
                                            <Search className="mr-2 h-4 w-4 text-blue-500" />
                                            <span className="font-medium">{keyword}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        )}
                    </Command>
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
            </motion.div>
            <motion.div 
                className="chart-parent flex justify-between"
                variants={itemVariants}
            >
                {matchesTimeline?.length >= 3 ? (
                    <AreaLineChart
                        data={matchesTimeline}
                        width={width}
                        height={300}
                        graphColor="#b1c4f5"
                    />
                ) : (
                    <ErrorComponent height={300} message="Not enough data points (minimum 3 required)"/>
                )}
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <Modal 
                        closeModal={() => setIsModalOpen(false)} 
                        messageFrequency={matchesTimeline} 
                        width={width} 
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
}

const Modal: React.FC<ModalProps> = ({ closeModal, messageFrequency, width }) => {
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
                    >
                        {messageFrequency?.length >= 3 ? (
                            <AreaLineChart
                                data={messageFrequency}
                                width={width * 1.5}
                                height={500}
                                graphColor="#b1c4f5"
                            />
                        ) : (
                            <ErrorComponent height={500} message="Not enough data points (minimum 3 required)"/>
                        )}
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default KeywordsMatchesTimeline;