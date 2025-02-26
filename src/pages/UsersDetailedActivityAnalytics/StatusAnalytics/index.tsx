import PresenceWeekActivityChart from "@/components/charts/userActivityTimeline/presenceActivityChart/userPresenceWeekActivityChart";
import TrendIndicator from '@/components/common/TrendIndicator';
import { Card } from "@/components/ui/card";
import { useStatusData, useMockActivityData, useStatusPageAnalyticsResponse } from '@/hooks/fetchData';
import StatusHeatmap from "@/components/charts/status/statusHeatmap";
import TopGamingStatuses from "./topGamingStatuses";
import StatusDataTableComponent from "@/components/common/StatusDataTable";

const StatusPageComponent = ({ }) => {
  const presenceAnalyticsResponse = useStatusPageAnalyticsResponse();
  const activityData = useMockActivityData(15);
  const statusData = useStatusData();

  return (
    <div className="w-full bg-gray-50 p-6">

      <div className="flex gap-6 mb-6">
        <Card className="flex-1 p-6 h-30">
          <div className="h-full flex flex-col items-left justify-center">
            <span className="text-gray-500 text-sm font-medium">Total Unique Statuses</span>
            <span className="text-2xl font-bold">{presenceAnalyticsResponse.totalUniqueStatuses}</span>
            <TrendIndicator unit={'%'} value={5} isPositive={true} />
          </div>
        </Card>
        <Card className="flex-1 p-6 h-30">
          <div className="h-full flex flex-col items-left justify-center">
            <span className="text-gray-500 text-sm font-medium">Avg Status Duration</span>
            <span className="text-2xl font-bold">{presenceAnalyticsResponse.avgStatusDuration}</span>
            <TrendIndicator unit={'%'} value={-3} isPositive={false} />
          </div>
        </Card>
        <Card className="flex-1 p-6 h-30">
          <div className="h-full flex flex-col items-left justify-center">
            <span className="text-gray-500 text-sm font-medium">Peak Activity Time</span>
            <span className="text-2xl font-bold">{presenceAnalyticsResponse.peakActivityTime}</span>
          </div>
        </Card>
        <Card className="flex-1 p-6 h-30">
          <div className="h-full flex flex-col items-left justify-center">
            <span className="text-gray-500 text-sm font-medium">Update Frequency</span>
            <span className="text-2xl font-bold">{presenceAnalyticsResponse.updateFrequency}</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <PresenceWeekActivityChart />
        <TopGamingStatuses topStatusMessages={presenceAnalyticsResponse.topStatusMessages}/>
      </div>

      <div className="mt-6">
        <Card className="p-6 w-full">
          <h3 className="text-lg font-bold mb-4">Status Activity Heatmap</h3>
          <StatusHeatmap activityData={activityData} />
        </Card>
      </div>

      <div className="mt-6">
        <Card className="p-6 w-full">
          <h3 className="text-lg font-bold mb-4">List Of Status Messages</h3>
          <StatusDataTableComponent data={statusData} />
        </Card>
      </div>
    </div>
  );
};

export default StatusPageComponent;
