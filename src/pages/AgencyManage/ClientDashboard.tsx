import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import ContentLoader from 'react-content-loader';
import { Download } from 'lucide-react';

// Reusable Components
import ErrorComponent from '@/components/common/errorModel';
import { Button } from '@/components/ui/button';
import StatCard from '@/pages/Dashboard/components/StatCard';
import ChartCard from '@/pages/Dashboard/components/ChartCard';
import UserActivityTimeline from '@/components/charts/userActivityTimeline/userActivityTimelineChartWrapper';
import MessageFrequencyChart from '@/components/charts/userActivityTimeline/messageFrequencyChart';

// Data Hooks & Types
import { TimeViewType, useDashboardData, useActivityTrend, useMessageTrend } from '@/hooks/analytics/useDashboardData';
import { useAggregateStats } from '@/hooks/analytics/useGamingAnalytics';
import { useGuildsData } from '@/hooks/useGuildsData';
import { useAuth } from '@/contexts/AuthContext';

// Skeleton Loader
const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
    <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
    </ContentLoader>
);

const ClientDashboard = () => {
    const { user } = useAuth(); // Get user from auth context
    const { guilds, isLoading: isLoadingGuilds, error: guildsError } = useGuildsData(user?.id ?? ""); // Get guilds data
    const guildName = guilds[0]?.name; // Get guild name from the guilds data
   
    // --- State for Chart View Types ---
    const [userActivityViewType, setUserActivityViewType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [messageViewType, setMessageViewType] = useState<TimeViewType>(TimeViewType.DAY);

    // --- Data Fetching Hooks ---
    const {
        totalUsers,
        totalMessages,
        topKeywords,
        isLoading: isDashboardLoading,
        error: dashboardError
    } = useDashboardData();

    const { data: activityTrend, isLoading: isActivityLoading } = useActivityTrend('user', userActivityViewType);
    const { trend: messageTrend, isLoading: isMessageLoading } = useMessageTrend(messageViewType === 'daily' ? TimeViewType.DAY : messageViewType === 'weekly' ? TimeViewType.WEEK : messageViewType === 'monthly' ? TimeViewType.MONTH : TimeViewType.YEAR);
    const { aggregateStats, isLoading: isGamingStatsLoading, error: gamingStatsError } = useAggregateStats();

    // --- UI State & Refs ---
    const [graphWidth, setGraphWidth] = useState(0);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    // --- Loading and Error States ---
    const isLoading = isDashboardLoading || isActivityLoading || isMessageLoading || isGamingStatsLoading;
    const error = dashboardError || gamingStatsError;

    // --- Resize Logic ---
    const updateGraphWidth = () => {
        if (wrapperRef.current) {
            setGraphWidth(wrapperRef.current.offsetWidth / 2.3);
        }
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver(updateGraphWidth);
        if (wrapperRef.current) {
            resizeObserver.observe(wrapperRef.current);
            updateGraphWidth();
        }
        return () => resizeObserver.disconnect();
    }, []);

    // --- Memoized Stats Cards ---
    // Note: Descriptions might be adjusted for client perspective if needed
    const statsCards = useMemo(() => [
        {
            title: "Total Users",
            value: totalUsers?.count.toLocaleString() ?? 0,
            description: totalUsers?.label ?? 'total members', // Example adjustment
            trend: totalUsers?.percentChange ?? 0,
            isTrendPositive: (totalUsers?.percentChange ?? 0) > 0,
            tooltipContent: `Total users in ${guildName}`,
            index: 0
        },
        {
            title: "Active Keywords",
            value: topKeywords?.length ?? 0,
            description: `Tracked Keywords`,
            trend: 0,
            isTrendPositive: true,
            tooltipContent: `Number of active keywords tracked in ${guildName}`,
            index: 1
        },
        {
            title: "Total Messages",
            value: totalMessages?.count.toLocaleString() ?? 0,
            description: totalMessages?.label ?? 'in this guild', // Example adjustment
            trend: totalMessages?.percentChange ?? 0,
            isTrendPositive: (totalMessages?.percentChange ?? 0) > 0,
            tooltipContent: `Total messages sent in ${guildName}`,
            index: 2
        },
        {
            title: "Median Play Session",
            value: aggregateStats?.medianSessionMinutes ?? 0,
            description: 'minutes',
            trend: aggregateStats?.medianSessionMinutesChange ?? 0,
            isTrendPositive: (aggregateStats?.medianSessionMinutesChange ?? 0) > 0,
            tooltipContent: `Median game playing session time in ${guildName}`,
            index: 3
        },
    ], [totalUsers, topKeywords, totalMessages, aggregateStats, guildName]);

    // --- Render Logic ---
    if (error) {
        return <ErrorComponent message={`Failed to load dashboard data: ${error.message}`} />;
    }

    return (
        <LayoutGroup>
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full min-h-screen bg-gray-50 p-6"
            >
                <motion.div
                    layout
                    id="client-dashboard-wrapper"
                    ref={wrapperRef}
                    className="block mx-auto"
                    style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
                            {guildName} Statistics
                        </h1>
                        {/* Optional: Client-specific actions could go here */}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 h-fit">
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <ChartCard key={i} className="flex-1" index={i}>
                                    <CardSkeleton width="100%" height="120px" />
                                </ChartCard>
                            ))
                        ) : (
                            statsCards.map((card) => (
                                <StatCard key={card.title} {...card} />
                            ))
                        )}
                    </div>

                    {/* Charts */}
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <ChartCard index={0} className="flex-1 min-h-[300px]">
                            {isLoading ? (
                                <CardSkeleton width="100%" height="300px" />
                            ) : (
                                <UserActivityTimeline
                                    activityTimeline={activityTrend?.data ?? []}
                                    width={graphWidth}
                                    isLoading={isActivityLoading}
                                    tooltipContent={`User activity trend in ${guildName}`}
                                    onViewTypeChange={(type) => setUserActivityViewType(type as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                                />
                            )}
                        </ChartCard>
                        <ChartCard index={1} className="flex-1 min-h-[300px]">
                            {isLoading ? (
                                <CardSkeleton width="100%" height="300px" />
                            ) : (
                                <MessageFrequencyChart
                                    messageFrequency={messageTrend ?? []}
                                    width={graphWidth}
                                    isLoading={isMessageLoading}
                                    onViewTypeChange={(type) => setMessageViewType(type as TimeViewType)}
                                />
                            )}
                        </ChartCard>
                    </div>
                </motion.div>
            </motion.div>
        </LayoutGroup>
    );
};

export default ClientDashboard;
