import AreaLineChart from "@/components/charts/AreaLineChart";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Expand, Minimize } from "lucide-react";
import { WeeklyTrend } from "@/types/analytics/gamingTypes";

interface UserActivityTimelineProps {
    width?: number;
    activityTimeline: WeeklyTrend[];
}

const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({
    width = 543,
    activityTimeline = []
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const chartData = activityTimeline.map(trend => ({
        date: trend.weekStartDate,
        count: trend.totalUsers
    }));

    return (
        <div className="h-full flex flex-col">
            <div className="text-gray-500 text-lg font-bold mb-4 cursor-pointer flex justify-between">
                <span>User Activity</span>
                <button onClick={openModal} style={{ padding: "4px" }}>
                    <Expand className="text-gray-500" />
                </button>
            </div>
            <div className="chart-parent flex justify-between">
                <AreaLineChart
                    data={chartData}
                    width={width} 
                    height={300}
                />
            </div>
            {isModalOpen && <Modal closeModal={closeModal} chartData={chartData} width={width} />}
        </div>
    );
};

const Modal: React.FC<{ closeModal: () => void; chartData: { date: string; count: number }[]; width: number }> = ({ closeModal, chartData, width }) => {
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded relative">
                <button
                    className="absolute top-2 right-2"
                    style={{ padding: "4px" }}
                    onClick={closeModal}
                >
                    <Minimize className="text-gray-500" />
                </button>
                <h2 className="text-lg font-bold mb-4">
                    User Activity
                </h2>
                <AreaLineChart
                    data={chartData}
                    width={width * 1.2} 
                    height={400} 
                />
            </div>
        </div>,
        document.body
    );
};

export default UserActivityTimeline;
