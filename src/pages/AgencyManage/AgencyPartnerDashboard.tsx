import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import ContentLoader from 'react-content-loader';
import { Download, Search } from 'lucide-react';
import ErrorComponent from '@/components/common/errorModel';
import { Button } from '@/components/ui/button';
import StatCard from '@/pages/Dashboard/components/StatCard';
import ChartCard from '@/pages/Dashboard/components/ChartCard';
import UserActivityTimeline from '@/components/charts/userActivityTimeline/userActivityTimelineChartWrapper';
import MessageFrequencyChart from '@/components/charts/userActivityTimeline/messageFrequencyChart';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useDashboardContext } from '@/common/context/queryContext'; // Import context hook
import { useAuth } from '@/contexts/AuthContext'; // Import auth hook
import { useGuildInfo } from '@/hooks/useGuildInfo'; // Import the guild info hook

import { TimeViewType, useDashboardData, useActivityTrend, useMessageTrend } from '@/hooks/analytics/useDashboardData';
import { useAggregateStats } from '@/hooks/analytics/useGamingAnalytics';

// Removed guildName from props as guildId will be managed by context
interface AgencyPartnerDashboardProps {}

interface GuildStat {
    id: string;
    name: string;
    members: number;
    messageFrequency: number;
    activeKeywords: number;
}

const MOCK_GUILD_STATS: GuildStat[] = [
    { id: '905833685977272371', name: 'MC Hub', members: 150, messageFrequency: 1200, activeKeywords: 15 },
    { id: '1306748279903621142', name: 'Gaming Central', members: 230, messageFrequency: 2500, activeKeywords: 20 },
    { id: '1100506368177340466', name: 'Dev Community', members: 85, messageFrequency: 800, activeKeywords: 10 },
    { id: '1074092144656134174', name: 'Dev Community', members: 85, messageFrequency: 800, activeKeywords: 10 },
    { id: '1328815689988964494', name: 'Dev Community', members: 85, messageFrequency: 800, activeKeywords: 10 },
    { id: '323644524268093441', name: 'Dev Community', members: 85, messageFrequency: 800, activeKeywords: 10 },
    { id: '1228072433408540773', name: 'Dev Community', members: 85, messageFrequency: 800, activeKeywords: 10 },
    { id: '119216385819490310', name: 'Dev Community', members: 85, messageFrequency: 800, activeKeywords: 10 },
];

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
    <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
    </ContentLoader>
);

// Removed Omit as guildId is no longer a prop
const AgencyPartnerDashboard: React.FC<AgencyPartnerDashboardProps> = () => {
    const { user } = useAuth(); // Get user from auth context
    const { guildId: selectedGuildId, setGuildId: setSelectedGuildId } = useDashboardContext(); // Get guildId and setter from dashboard context, aliased for clarity
    const { guildName } = useGuildInfo(selectedGuildId); // Get guild name from the new hook
    const [userActivityViewType, setUserActivityViewType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [messageViewType, setMessageViewType] = useState<TimeViewType>(TimeViewType.DAY);
    const [guildSearchTerm, setGuildSearchTerm] = useState("");
    // Removed selectedGuildId state, using guildId from context instead

    // Effect to set initial guildId based on user's guilds
    useEffect(() => {
        // TODO: Replace user?.guildIds with the actual list of guilds accessible to the Agency Partner
        // This might involve fetching agency details and their assigned guilds.
        // For now, using the placeholder logic.
        const accessibleGuildIds = user?.guildIds; // Placeholder: Use actual accessible guilds for the partner
        if (!selectedGuildId && accessibleGuildIds && accessibleGuildIds.length > 0) {
            // You might want a different default logic for partners,
            // e.g., selecting the first guild in their accessible list.
            const defaultGuildId = "1306748279903621142"; // Consider if this default is appropriate here
            const guildToSet = accessibleGuildIds.includes(defaultGuildId) ? defaultGuildId : accessibleGuildIds[0];
            setSelectedGuildId(guildToSet);
        }
    }, [user, selectedGuildId, setSelectedGuildId]); // Dependencies include user, guildId, and setGuildId

    const {
        totalUsers,
        totalMessages,
        topKeywords,
        isLoading: isDashboardLoading,
        error: dashboardError
    } = useDashboardData();

    const { data: activityTrend, isLoading: isActivityLoading } = useActivityTrend('user', userActivityViewType);
    const { trend: messageTrend, isLoading: isMessageLoading } = useMessageTrend(messageViewType);
    const { aggregateStats, isLoading: isGamingStatsLoading, error: gamingStatsError } = useAggregateStats();

    const [graphWidth, setGraphWidth] = useState(0);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    const isLoading = isDashboardLoading || isActivityLoading || isMessageLoading || isGamingStatsLoading;
    const error = dashboardError || gamingStatsError;

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

    const filteredGuilds = useMemo(() => {
        return MOCK_GUILD_STATS.filter(guild =>
            guild.name.toLowerCase().includes(guildSearchTerm.toLowerCase())
        );
    }, [guildSearchTerm]);

    const statsCards = useMemo(() => [
        {
            title: "Total Users",
            value: totalUsers?.count ?? 0,
            description: totalUsers?.label ?? '',
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
            value: totalMessages?.count ?? 0,
            description: totalMessages?.label ?? '',
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
                    id="agency-partner-dashboard-wrapper"
                    ref={wrapperRef}
                    className="block mx-auto"
                    style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
                            {guildName} Statistics
                        </h1>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export Report
                        </Button>
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

                    {/* --- Guild Statistics Table Section --- */}
                    <ChartCard title="Guild Statistics" className="mt-6" index={2}>
                        <div className="flex items-center justify-between mb-4 px-6 pt-4">
                            <div className="relative w-full max-w-sm">
                                <Input
                                    type="search"
                                    placeholder="Search guilds..."
                                    value={guildSearchTerm}
                                    onChange={(e) => setGuildSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            <Button className="bg-blue-500 hover:bg-blue-600 hover:text-white text-white text-sm font-normal" variant="outline" size="sm">Export Data</Button>
                        </div>
                        <div className="rounded-md border mx-6 mb-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Guild Name</TableHead>
                                        <TableHead className="text-center">Members</TableHead>
                                        <TableHead className="text-center">Message Freq.</TableHead>
                                        <TableHead className="text-center">Active Keywords</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredGuilds.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No guilds found matching "{guildSearchTerm}".
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredGuilds.map((guild) => (
                                            <TableRow
                                                key={guild.id}
                                                onClick={() => setSelectedGuildId(guild.id)}
                                                className={`cursor-pointer hover:bg-muted/50 ${selectedGuildId === guild.id ? 'bg-muted/50' : ''}`}
                                            >
                                                <TableCell className="font-medium">{guild.name}</TableCell>
                                                <TableCell className="text-center">{guild.members.toLocaleString()}</TableCell>
                                                <TableCell className="text-center">{guild.messageFrequency.toLocaleString()}</TableCell>
                                                <TableCell className="text-center">{guild.activeKeywords.toLocaleString()}</TableCell>
                                                <TableCell className="text-center">
                                                    {selectedGuildId === guild.id && (
                                                        <Badge variant="default">Selected</Badge>
                                                    )}
                                                    {selectedGuildId !== guild.id && (
                                                        <Badge variant="outline">Not Selected</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </ChartCard>

                </motion.div>
            </motion.div>
        </LayoutGroup>
    );
};

export default AgencyPartnerDashboard;
