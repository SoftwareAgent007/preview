import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CircleRoleChart from "../circleChartOfRoles";

const RolesChart = () => {
    
    const mockData = [
        { role: "Owner", count: 234, percentage: 10, color: "#FF5733" },
        { role: "Admin",  count: 469, percentage: 20, color: "#33FF57" },
        { role: "User",  count: 1407, percentage: 60, color: "#3357FF" },
        { role: "Moderator",  count: 234, percentage: 10, color: "#FF33A8" },
    ];

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Active Roles diagram</CardTitle>
            </CardHeader>
            <CardContent>
                <CircleRoleChart data={mockData} />
                <div className="legend flex justify-center gap-8 mt-6 text-lg">
                    {mockData.map((item) => (
                        <div key={item.role} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md" style={{ backgroundColor: item.color }} />
                            <span className="text-lg font-medium">{item.role}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default RolesChart;
