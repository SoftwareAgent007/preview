import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";

const Dashboard = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH}px` }}>
        <div className="flex justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.KEYWORD_ANALYTICS]} />
        </div>

        <div className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex items-center justify-center text-gray-500">Card 1</div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex items-center justify-center text-gray-500">Card 2</div>
          </Card>
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex items-center justify-center text-gray-500">Card 2</div>
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

        <div className="w-full gap-6">
          <Card className="p-6 h-150">
            <div className="h-full flex items-center justify-center text-gray-500">Card 6</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


