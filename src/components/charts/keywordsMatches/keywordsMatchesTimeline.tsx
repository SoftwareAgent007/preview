import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import AreaLineChart from "@/components/charts/areaLineChart";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Expand, Minimize } from "lucide-react";

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
                <span>Message Activity</span>
                <button onClick={openModal} style={{ padding: "4px" }}>
                    <Expand />
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
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50 scale-175">
            <div className="bg-white p-4 rounded relative">
                <button
                    className="absolute top-2 right-2 scale-75"
                    style={{ padding: "4px" }}
                    onClick={closeModal}
                >
                    <Minimize />
                </button>
                <h2 className="text-lg font-bold mb-4">
                    Message Activity Details
                </h2>
                <AreaLineChart
                    data={messageFrequency}
                    width={width}
                    height={300}
                    graphColor="#b1c4f5"
                />
            </div>
        </div>,
        document.body
    );
};

export default MessageFrequencyChart;