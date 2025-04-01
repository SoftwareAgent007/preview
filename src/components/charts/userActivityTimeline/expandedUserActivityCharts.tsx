import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MultiLayerAreaChart from "../combinedAreaChart";
import { DataSet } from "@/components/common/types/userAnalytic.types";
import { useEffect, useRef, useState } from "react";
import { ClickableTooltip } from "@/components/ui/tooltip";
import ErrorComponent from "@/components/common/errorModel";
import { motion } from "framer-motion";
import { useActivityTrend } from "@/hooks/analytics/useUserActivityAnalytics";
import ContentLoader from "react-content-loader";


const LoaderCard = ({ width, height }: { width: string; height: string }) => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
);

const ActivityCharts = ({
    className,
}: {
    className?: string;
}) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const [chartWidth, setChartWidth] = useState(800);
    const [chartHeight, setChartHeight] = useState(300);

    const { data: userTrend, isLoading: userLoading } = useActivityTrend({
        activityType: 'user',
        viewType: 'daily'
    });
    
    const { data: spotifyTrend, isLoading: spotifyLoading } = useActivityTrend({
        activityType: 'spotify',
        viewType: 'daily'
    });
    
    const { data: gamingTrend, isLoading: gamingLoading } = useActivityTrend({
        activityType: 'gaming',
        viewType: 'daily'
    });

    const isLoading = userLoading || spotifyLoading || gamingLoading;
    
    const processedData: DataSet = {
        'Active Users': {
            data: userTrend?.data?.map(point => ({ date: new Date(point.date).toISOString(), count: point.activeUsers })) || [],
            color: '#4F46E5'
        },
        'Spotify Users': {
            data: spotifyTrend?.data?.map(point => ({ date: new Date(point.date).toISOString(), count: point.activeUsers })) || [],
            color: '#10B981'
        },
        'Gaming Users': {
            data: gamingTrend?.data?.map(point => ({ date: new Date(point.date).toISOString(), count: point.activeUsers })) || [],
            color: '#EF4444'
        }
    };


    const updateChartDimensions = () => {
        if (chartRef.current) {
            const containerWidth = chartRef.current.offsetWidth;

            // Responsive sizing based on container and screen size
            if (window.innerWidth < 640) {
                // Mobile
                setChartWidth(containerWidth);
                setChartHeight(250);
            } else if (window.innerWidth < 1024) {
                // Tablet
                setChartWidth(containerWidth);
                setChartHeight(300);
            } else {
                // Desktop
                setChartWidth(containerWidth);
                setChartHeight(300);
            }
        }
    };
    
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            updateChartDimensions()
        });
        
        if (chartRef.current) {
            resizeObserver.observe(chartRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [chartRef.current]);

    // #region Animation Variants
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
    // #endregion

    return (
        <Card
            className={`w-full max-w-[1200px] hover:scale-[101%] transition-all duration-150 ${className}`}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <CardHeader>
                    <CardTitle>
                        <motion.div
                            className="flex justify-between items-center"
                            variants={itemVariants}
                        >
                            <motion.div
                                className="title flex items-center gap-3"
                                variants={itemVariants}
                            >
                                <motion.span
                                    className="text-gray-500 text-lg font-bold"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    User Activity Overview
                                </motion.span>
                                <ClickableTooltip
                                    content={
                                        <motion.p
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <strong>
                                                Activity Overview:{" "}
                                            </strong>
                                            Shows the ratio of online users
                                            to users actively playing games
                                            within a given timeframe.
                                        </motion.p>
                                    }
                                >
                                    <motion.span
                                        className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help"
                                        whileHover={{
                                            scale: 1.1,
                                            backgroundColor:
                                                "rgba(209, 213, 219, 0.4)",
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        ?
                                    </motion.span>
                                </ClickableTooltip>
                            </motion.div>
                        </motion.div>
                    </CardTitle>
                </CardHeader>
                <CardContent ref={chartRef}>
                    <motion.div
                        className="space-y-4"
                        variants={itemVariants}
                    >
                        <motion.div
                            className="flex flex-wrap gap-4 mb-2"
                            variants={itemVariants}
                        >
                            {isLoading ? (
                                <motion.div className="p-6 w-full h-[339px]">
                                    <LoaderCard width="100%" height="100%" />
                                </motion.div>
                            ) : Object.keys(processedData).length ? (
                                <>
                                    {Object.entries(processedData).map(([key, value]) => (
                                        <motion.div
                                            key={key}
                                            className="flex items-center gap-2"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor: value.color,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">
                                                {key}
                                            </span>
                                        </motion.div>
                                    ))}
                                    <motion.div variants={itemVariants}>
                                        <MultiLayerAreaChart
                                            datasets={processedData}
                                            width={chartWidth}
                                            height={chartHeight}
                                        />
                                    </motion.div>
                                </>
                            ) : (
                                <ErrorComponent />
                            )}
                        </motion.div>
                    </motion.div>
                </CardContent>
            </motion.div>
        </Card>
    );
};

export default ActivityCharts;