import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { Download } from "lucide-react";

const mockData = {
  totalUsers: {
    count: 24892,
    change: 12,
    isIncrease: true
  },
  activeUsers: {
    current: 1234,
    sevenDays: 5432,
    thirtyDays: 12456
  },
  totalMessages: {
    count: 892381,
    change: 8,
    isIncrease: true
  },
  totalReactions: {
    count: 234567,
    change: 15,
    isIncrease: false
  }
};

const Dashboard = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <div className="flex justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.DASHBOARD]} />
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Full Report
          </Button>
        </div>

        <div className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm">Total Users</span>
              <span className="text-2xl font-bold">{mockData.totalUsers.count.toLocaleString()}</span>
              <span className={`text-sm ${mockData.totalUsers.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                {mockData.totalUsers.change}% increase
              </span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm">Active Users</span>
              <span className="text-2xl font-bold">{mockData.activeUsers.current.toLocaleString()}</span>
              <div className="text-sm text-gray-400">
                <div>7d: {mockData.activeUsers.sevenDays.toLocaleString()}</div>
                <div>30d: {mockData.activeUsers.thirtyDays.toLocaleString()}</div>
              </div>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm">Total Messages</span>
              <span className="text-2xl font-bold">{mockData.totalMessages.count.toLocaleString()}</span>
              <span className={`text-sm ${mockData.totalMessages.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                {mockData.totalMessages.change}% increase
              </span>
            </div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm">Total Reactions</span>
              <span className="text-2xl font-bold">{mockData.totalReactions.count.toLocaleString()}</span>
              <span className={`text-sm ${mockData.totalReactions.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                {mockData.totalReactions.change}% decrease
              </span>
            </div>
          </Card>
        </div>

        <div className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-100">
            <div className="h-full flex items-center justify-center text-gray-500">Card 1</div>
          </Card>
          <Card className="flex-1 p-6 h-100">
            <div className="h-full flex items-center justify-center text-gray-500">Card 2</div>
          </Card>
        </div>

        <div className="flex justify-between gap-6 mb-6">
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex items-center justify-center text-gray-500">Card 3</div>
          </Card>
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex items-center justify-center text-gray-500">Card 4</div>
          </Card>
          <Card className="w-[35%] p-6 h-70">
            <div className="h-full flex items-center justify-center text-gray-500">Card 5</div>
          </Card>
        </div>

        <div className="flex justify-between gap-6">
          <Card className="flex-1 p-6 h-100">
            <div className="h-full flex items-center justify-center text-gray-500">Card 6</div>
          </Card>
          <div className="flex-1 grid grid-cols-2 gap-6">
            <Card className="p-6 р-50">
              <div className="h-full flex items-center justify-center text-gray-500">Card 7</div>
            </Card>
            <Card className="p-6 р-50">
              <div className="h-full flex items-center justify-center text-gray-500">Card 8</div>
            </Card>
            <Card className="p-6 р-50">
              <div className="h-full flex items-center justify-center text-gray-500">Card 9</div>
            </Card>
            <Card className="p-6 р-50">
              <div className="h-full flex items-center justify-center text-gray-500">Card 10</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
