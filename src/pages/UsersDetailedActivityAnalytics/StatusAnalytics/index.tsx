import { Card } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
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
          <Card className="flex-1 p-6 h-30">
            <div className="h-full flex items-center justify-center text-gray-500">Card 2</div>
          </Card>
        </div>


        <div className="flex gap-6 mb-6">
          <Card className="flex-3 p-6 h-100">
            <div className="h-full flex items-center justify-center text-gray-500">Card 1</div>
          </Card>
          <Card className="flex-2 p-6 h-100">
            <div className="h-full flex items-center justify-center text-gray-500">Card 2</div>
          </Card>
        </div>

        <div className="w-full gap-6 mb-6">
          <Card className="p-6 h-150">
            <div className="h-full flex items-center justify-center text-gray-500">Card 6</div>
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


