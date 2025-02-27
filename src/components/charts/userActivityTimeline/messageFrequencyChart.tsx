import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import AreaLineChart from "@/components/charts/AreaLineChart";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Expand, Minimize } from "lucide-react";
import { ClickableTooltip } from "@/components/ui/tooltip";

interface MessageFrequencyChartProps {
    width?: number;
}

const MessageFrequencyChart: React.FC<MessageFrequencyChartProps> = ({ width = 543 }) => {
    const { messageFrequency } = useDashboardData("month");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="h-full flex flex-col">
            <div className="text-gray-500 text-lg font-bold mb-4 cursor-pointer flex justify-between">
                <div className="title">
                    <span className="mr-5">Keywords Activity</span>
                    <ClickableTooltip content={<p><strong>Message Frequency: </strong>Shows the frequency of messages sent over time (week, month, or year). Adjusting the timeframe updates the data and redirects to the "User Activity Analytics" page.</p>}>
                        <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
                    </ClickableTooltip>
                </div>
                <button onClick={openModal} style={{ padding: "4px" }}>
                    <Expand className="text-gray-500" />
                </button>
            </div>
            <div className="chart-parent flex justify-between">
                <AreaLineChart
                    data={messageFrequency}
                    width={width}
                    height={300}
                    graphColor="#b1c4f5"
                />
            </div>
            {isModalOpen && <Modal closeModal={closeModal} messageFrequency={messageFrequency} width={width} />}
        </div>
    );
};

const Modal: React.FC<{ closeModal: () => void; messageFrequency: any; width: number }> = ({ closeModal, messageFrequency, width }) => {
    const handleOutsideClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest(".modal-content") === null) {
            closeModal();
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={handleOutsideClick}>
            <div className="bg-white p-4 rounded relative modal-content">
                <button
                    className="absolute top-2 right-2"
                    style={{ padding: "4px" }}
                    onClick={closeModal}
                >
                    <Minimize className="text-gray-500" />
                </button>
                <h2 className="text-gray-500 text-lg font-bold mb-4">Keywords Activity</h2>
                <AreaLineChart
                    data={messageFrequency}
                    width={width * 1.2}
                    height={400}
                    graphColor="#b1c4f5"
                />
            </div>
        </div>,
        document.body
    );
};

export default MessageFrequencyChart;