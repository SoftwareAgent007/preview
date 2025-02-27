import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MultiLayerAreaChart from "../combinedAreaChart";
import { DataSet } from "@/components/common/types/userAnalytic.types";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Expand, Minimize } from "lucide-react";
import { ClickableTooltip } from "@/components/ui/tooltip";

const ActivityCharts = ({ data, className }: {data: DataSet; className?: string}) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const [chartWidth, setChartWidth] = useState(800); 
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
                        <div className="title">
                            <span className="text-gray-500 text-lg font-bold mb-4 mr-5">
                                User Activity Overview
                            </span> 
                            <ClickableTooltip content={<p><strong>Activity Overview: </strong>Shows the ratio of online users to users actively playing games within a given timeframe (week or month). Changing the timeframe updates the data accordingly.</p>}>
                                <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
                            </ClickableTooltip>
                        </div>
                        <button onClick={openModal} style={{ padding: "4px" }}>
                            <Expand className="text-gray-500" />
                        </button>
                    </CardTitle>
                </CardHeader>
                <CardContent ref={chartRef}>
                    <div className="space-y-1">
                        <div className="flex gap-4 mb-2">
                            {Object.entries(data).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: value.color }} />
                                    </div>
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
    const handleOutsideClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest(".modal-content") === null) {
            closeModal();
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={handleOutsideClick}>
            <div className="bg-white p-4 rounded relative modal-content">
                <button className="absolute top-2 right-2" style={{ padding: "4px" }} onClick={closeModal}>
                    <Minimize className="text-gray-500" />
                </button>
                <h2 className="text-gray-500 text-lg font-bold mb-4">User Activity Overview</h2>
                <MultiLayerAreaChart datasets={datasets} width={chartWidth * 1.2} height={400} />
            </div>
        </div>,
        document.body
    );
};

export default ActivityCharts;
