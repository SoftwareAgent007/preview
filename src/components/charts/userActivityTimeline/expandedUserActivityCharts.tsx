import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MultiLayerAreaChart from "../combinedAreaChart";
import { DataSet } from "@/components/common/types/userAnalytic.types";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Expand, Minimize } from "lucide-react";

const ActivityCharts = ({ data, className }: {data: DataSet; className?: string}) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const [chartWidth, setChartWidth] = useState(800); // Default width
    const [isModalOpen, setIsModalOpen] = useState(false);

    const updateChartWidth = () => {
        if (chartRef.current) {
            setChartWidth(chartRef.current.offsetWidth);
        }
    };

    useEffect(() => {
        updateChartWidth();
        window.addEventListener("resize", updateChartWidth);
        return () => window.removeEventListener("resize", updateChartWidth);
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <Card className={`w-full max-w-[1200px] ${className}`}>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        User Activity Overview
                        <button onClick={openModal} style={{ padding: "4px" }}>
                            <Expand />
                        </button>
                    </CardTitle>
                </CardHeader>
                <CardContent ref={chartRef}>
                    <div className="space-y-1">
                        <div className="flex gap-4 mb-2">
                            {Object.entries(data).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: value.color }} />
                                    <span className="text-sm font-medium">
                                        {key}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <MultiLayerAreaChart datasets={data} width={chartWidth} height={300} />
                    </div>
                </CardContent>
            </Card>
            {isModalOpen && (
                <Modal closeModal={closeModal} datasets={data} chartWidth={chartWidth} />
            )}
        </>
    );
};

const Modal: React.FC<{ closeModal: () => void; datasets: DataSet; chartWidth: number }> = ({ closeModal, datasets, chartWidth }) => {
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded relative">
                <button className="absolute top-2 right-2" style={{ padding: "4px" }} onClick={closeModal}>
                    <Minimize />
                </button>
                <h2 className="text-lg font-bold mb-4">User Activity Overview Details</h2>
                <MultiLayerAreaChart datasets={datasets} width={chartWidth * 1.2} height={400} />
            </div>
        </div>,
        document.body
    );
};

export default ActivityCharts;
