import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MultiLayerAreaChart from "../combinedAreaChart";
import { DataSet } from "@/components/common/types/userAnalytic.types";

const ActivityCharts = ({ data }: {data: DataSet}) => {
    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>User Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="flex gap-4 mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500 opacity-20" />
                            <span className="text-sm font-medium">
                                Active Users
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 opacity-40" />
                            <span className="text-sm font-medium">
                                Playing Now
                            </span>
                        </div>
                    </div>
                    <MultiLayerAreaChart datasets={data} width={800} height={300} />
                </div>
            </CardContent>
        </Card>
    );
};

export default ActivityCharts;
