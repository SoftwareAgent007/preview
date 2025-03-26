import { FC, HTMLAttributes } from 'react';
import { Card } from '@/components/ui/card';
import ActivityCharts from '@/components/charts/userActivityTimeline/expandedUserActivityCharts';

interface ChartDataPoint {
  date: string;
  count: number;
}

interface ChartData {
  data: ChartDataPoint[];
  color: string;
  label: string;
}

interface DataSet {
  [key: string]: ChartData;
}

interface ActivityChartsSectionProps extends HTMLAttributes<HTMLDivElement> {
  data: DataSet;
  className?: string;
}

const ActivityChartsSection: FC<ActivityChartsSectionProps> = ({ data, className, ...props }) => {
  return (
    <div className={className} {...props}>
      <ActivityCharts data={data} />
    </div>
  );
};

export default ActivityChartsSection; 