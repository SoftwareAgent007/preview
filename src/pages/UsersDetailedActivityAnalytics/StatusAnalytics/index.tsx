import StatusActivityChart from "@/components/charts/status/userStatusActivityChart";
import TrendIndicator from '@/components/common/TrendIndicator';
import { Card } from "@/components/ui/card";
import { useStatusData, useMockActivityData, useStatusPageAnalyticsResponse } from '@/hooks/fetchData';
import StatusHeatmap from "@/components/charts/status/statusHeatmap";
import TopGamingStatuses from "./topGamingStatuses";
import StatusDataTableComponent from "@/components/common/StatusDataTable";
import { ClickableTooltip } from "@/components/ui/tooltip";
import SearchableSelect from "@/components/ui/searchebleSelect";
import { useState } from "react";

const StatusPageComponent = ({ }) => {
  const presenceAnalyticsResponse = useStatusPageAnalyticsResponse();
  const activityData = useMockActivityData(15);
  const statusData = useStatusData();
  const [selectedStatus, setStatus] = useState('Studying');
  const mockerStatuses = [
    { value: "Gaming Time", label: "Gaming Time" },
    { value: "AFK", label: "AFK" },
    { value: "Voice", label: "Voice" },
    { value: "Studying", label: "Studying" },
    { value: "Chatting", label: "Chatting" },
  ];

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
        <StatusActivityChart />
        <TopGamingStatuses topStatusMessages={presenceAnalyticsResponse.topStatusMessages}/>
      </div>

      <div className="mt-6">
        <Card className="p-6 w-full">
          <div className="title">
            <span className="text-gray-500 text-lg font-bold mr-5">Status Activity Heatmap</span>
            <ClickableTooltip content={<p><strong>Status Activity Heatmap:</strong> Displays the number of statuses selected each day during a week in the season. The background darkens based on the difference in numbers.</p>}>
              <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
            </ClickableTooltip>
            <SearchableSelect
              className="ml-5"
              options={mockerStatuses}
              placeholder="Select status..."
              value={selectedStatus}
              onChange={setStatus}
            />
          </div>
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
