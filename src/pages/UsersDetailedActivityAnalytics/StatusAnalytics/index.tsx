import { Card } from "@/components/ui/card";
import TrendIndicator from '@/components/common/TrendIndicator';
import PresenceWeekActivityChart from "@/components/charts/userActivityTimeline/presenceActivityChart/userPresenceWeekActivityChart";
import StatusDataTableComponent from '@/components/common/StatusDataTable';
import { useStatusPageAnalyticsResponse } from '@/hooks/fetchData';

const StatusPageComponent = ({ }) => {
  const presenceAnalyticsResponse = useStatusPageAnalyticsResponse();

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
        <div className="w-full gap-6">
          <Card className="p-6 h-150">
            {/* <StatusDataTableComponent 
              displayedKeywords={presenceAnalyticsResponse.topStatusMessages} 
              searchTerm={""} 
              setSearchTerm={() => {}} 
              currentPage={1} 
              setCurrentPage={() => {}} 
              totalPages={10}
              onPageSizeChange={() => {}}
              pageSize={10}
            /> */}
          </Card>
        </div>
      </div>
    </div>
  );
};


export default StatusPageComponent