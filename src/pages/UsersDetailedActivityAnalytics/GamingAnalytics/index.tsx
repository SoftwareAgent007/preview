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

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="grid grid-rows-10 h-[1000px] gap-6">
            <Card className="p-6 row-span-6">
              <div className="h-full flex items-center justify-center text-gray-500">Card 1</div>
            </Card>
            <Card className="p-6 row-span-4">
              <div className="h-full flex items-center justify-center text-gray-500">Card 1</div>
            </Card>
          </div>
          
          <div className="grid grid-rows-8 gap-6 h-[1000px]">
            <Card className="p-6 row-span-3">
              <div className="h-full flex items-center justify-center text-gray-500">Card 2</div>
            </Card>
            <Card className="p-6 row-span-5">
              <div className="h-full flex items-center justify-center text-gray-500">Card 3</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


