import { Card, CardContent } from "@/components/ui/card";
import CircleRoleChart from "../circleChartOfRoles";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Expand, Minimize } from "lucide-react";

const RolesChart = () => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const [chartWidth, setChartWidth] = useState(800); // Default width
    const [chartHeight, setChartHeight] = useState(500); // Default height
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mockData = [
        { role: "Owner", count: 234, percentage: 10, color: "#FF5733" },
        { role: "Admin", count: 469, percentage: 20, color: "#33FF57" },
        { role: "User", count: 1407, percentage: 60, color: "#3357FF" },
        { role: "Moderator", count: 234, percentage: 10, color: "#FF33A8" },
    ];

    const updateChartDimensions = () => {
        if (chartRef.current) {
            setChartWidth(chartRef.current.offsetWidth * 0.5);
            setChartHeight(chartRef.current.offsetHeight * 0.5);
        }
    };

    useEffect(() => {
        updateChartDimensions();
        window.addEventListener("resize", updateChartDimensions);
        return () => window.removeEventListener("resize", updateChartDimensions);
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <Card className="w-full max-w-4xl" ref={chartRef}>
                <div className="text-gray-500 text-lg font-bold mb-4 cursor-pointer flex justify-between">
                    <span>User Activity</span>
                    <button onClick={openModal} style={{ padding: "4px" }}>
                        <Expand />
                    </button>
                </div>
                <CardContent>
                    <CircleRoleChart width={chartWidth} height={chartHeight} data={mockData} />
                    <div className="legend flex justify-center gap-8 mt-6 text-lg">
                        {mockData.map((item) => (
                            <div key={item.role} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-md" style={{ backgroundColor: item.color }} />
                                <span className="text-lg font-medium">{item.role}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {isModalOpen && (
                <Modal closeModal={closeModal} chartWidth={chartWidth * 2} chartHeight={chartHeight * 2} data={mockData} />
            )}
        </>
    );
};

const Modal: React.FC<{ closeModal: () => void; chartWidth: number; chartHeight: number; data: typeof mockData }> = ({ closeModal, chartWidth, chartHeight, data }) => {
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded relative">
                <button className="absolute top-2 right-2" style={{ padding: "4px" }} onClick={closeModal}>
                    <Minimize />
                </button>
                <h2 className="text-lg font-bold mb-4">Active Roles Diagram</h2>
                <CircleRoleChart width={chartWidth} height={chartHeight} data={data} />
            </div>
        </div>,
        document.body
    );
};

export default RolesChart;
