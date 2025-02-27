import { useDashboardData } from "@/hooks/analytics/useDashboardData";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Expand, Minimize } from "lucide-react";
import AreaLineChart from "@/components/charts/AreaLineChart";
import { ClickableTooltip } from "@/components/ui/tooltip";

interface UserActivityTimelineProps {
    width?: number;
}

const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({
    width = 543,
}) => {
    const { userActivityTimeline } = useDashboardData("month");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="flex flex-col">
            <div className="text-gray-500 text-lg font-bold mb-4 cursor-pointer flex justify-between">
                <div className="title">
                    <span className="mr-3">Active users</span>
                    <ClickableTooltip content={<p><strong>User Activity Timeline: </strong> Displays the number of users over different time periods (week, month, or year). Timeframe redirects to the "Activity Analytics" page.</p>}>
                        <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
                    </ClickableTooltip>
                </div>
                <button onClick={openModal} style={{ padding: "4px" }}>
                    <Expand className="text-gray-500" />
                </button>
            </div>
            <div className="chart-parent flex justify-between">
                <AreaLineChart
                    data={userActivityTimeline}
                    width={width} // Use provided width directly
                    height={300}
                />
            </div>
            {isModalOpen && <Modal closeModal={closeModal} userActivityTimeline={userActivityTimeline} width={width} />}
        </div>
    );
};

const Modal: React.FC<{ closeModal: () => void; userActivityTimeline: any; width: number }> = ({ closeModal, userActivityTimeline, width }) => {
    const handleOutsideClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest('.modal-content') === null) {
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
                <h2 className="text-gray-500 text-lg font-bold mb-4">
                    Active Users
                </h2>
                <AreaLineChart
                    data={userActivityTimeline}
                    width={width * 1.2}
                    height={400}
                />
            </div>
        </div>,
        document.body
    );
};

export default UserActivityTimeline;
