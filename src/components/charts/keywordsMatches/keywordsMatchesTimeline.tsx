import AreaLineChart from "@/components/charts/AreaLineChart";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { TimelineDataDto } from "@/types/dataTypes";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, Minimize } from "lucide-react";
import React, { useState } from "react";
import ReactDOM from "react-dom";
interface MessageFrequencyChartProps {
    matchesTimeline: TimelineDataDto[]
    width?: number;
}

const KeywordsMatchesTimeline: React.FC<MessageFrequencyChartProps> = ({ matchesTimeline, width = 543 }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                        Message Activity
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
                    <motion.input
                        type="text"
                        placeholder="Search keywords..."
                        value={""}
                        onChange={(e) => {}}
                        className="p-1 border border-gray-300 rounded text-sm"
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
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
                className="chart-parent"
                variants={itemVariants}
            >
                <AreaLineChart
                    data={matchesTimeline}
                    width={width}
                    height={300}
                    graphColor="#b1c4f5"
                />
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <Modal 
                        closeModal={() => setIsModalOpen(false)} 
                        messageFrequency={messageFrequency} 
                        width={width} 
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface ModalProps {
    closeModal: () => void;
    messageFrequency: any;
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
                        <AreaLineChart
                            data={messageFrequency}
                            width={width * 1.5}
                            height={500}
                            graphColor="#b1c4f5"
                        />
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default KeywordsMatchesTimeline;