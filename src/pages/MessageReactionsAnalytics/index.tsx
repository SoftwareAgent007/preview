import BackToBackHistogram from "@/components/charts/reactions/reactionsBalanceChart";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { useEffect, useRef, useState } from "react";

const MessageReactionsAnalytics = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [graphWidth, setGraphWidth] = useState(0);

  useEffect(() => {
    const updateGraphWidth = () => {
      if (wrapperRef.current) {
        setGraphWidth(wrapperRef.current.offsetWidth - 40);
      }
    };

    window.addEventListener("resize", updateGraphWidth);
    updateGraphWidth();

    return () => window.removeEventListener("resize", updateGraphWidth);
  }, []);

  const mockData = [
    { date: "2024-11-21", positive: 150, neutral: 50, negative: -30 },
    { date: "2024-11-22", positive: 200, neutral: 60, negative: -40 },
    { date: "2024-11-23", positive: 180, neutral: 55, negative: -35 },
    { date: "2024-11-24", positive: 220, neutral: 65, negative: -50 },
    { date: "2024-11-25", positive: 170, neutral: 45, negative: -20 },
    { date: "2024-11-26", positive: 210, neutral: 70, negative: -45 },
    { date: "2024-11-27", positive: 190, neutral: 80, negative: -25 },
    { date: "2024-11-28", positive: 230, neutral: 75, negative: -55 },
    { date: "2024-11-29", positive: 240, neutral: 90, negative: -60 },
    { date: "2024-11-30", positive: 200, neutral: 85, negative: -50 },
    { date: "2024-12-01", positive: 210, neutral: 95, negative: -40 },
    { date: "2024-12-02", positive: 250, neutral: 100, negative: -270 },
    { date: "2024-12-03", positive: 200, neutral: 85, negative: -50 },
    { date: "2024-12-04", positive: 210, neutral: 95, negative: -40 },
    { date: "2024-12-05", positive: 250, neutral: 100, negative: -270 },
    { date: "2024-12-07", positive: 200, neutral: 85, negative: -50 },
    { date: "2024-12-08", positive: 210, neutral: 95, negative: -40 },
    { date: "2024-12-09", positive: 250, neutral: 100, negative: -270 },
    { date: "2024-12-10", positive: 200, neutral: 85, negative: -50 },
    { date: "2024-12-11", positive: 210, neutral: 95, negative: -40 },
    { date: "2024-12-12", positive: 250, neutral: 100, negative: -270 },
  ];

  const totalReactions = mockData.reduce(
    (acc, data) => acc + data.positive + data.neutral + Math.abs(data.negative),
    0
  );

  const calculatePercentage = (value: number) =>
    ((value / totalReactions) * 100).toFixed(2);

  const positivePercentage = calculatePercentage(
    mockData.reduce((acc, data) => acc + data.positive, 0)
  );
  const neutralPercentage = calculatePercentage(
    mockData.reduce((acc, data) => acc + data.neutral, 0)
  );
  const negativePercentage = calculatePercentage(
    Math.abs(mockData.reduce((acc, data) => acc + data.negative, 0))
  );

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      <div
        ref={wrapperRef}
        className="mx-auto max-w-[1200px] space-y-6"
      >
        <BreadcrumbsNavigation
          items={BREADCRUMB_PATHS[ROUTES.MESSAGE_REACTIONS]}
        />

        <Card className="p-6 shadow-lg bg-white rounded-2xl">
          <h2 className="text-gray-500 text-lg font-bold mb-1">
            Message Reactions Overview
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            A breakdown of message reactions over time.
          </p>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-40 gap-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-semibold text-green-500">
                {positivePercentage}%
              </span>
              <span className="text-gray-700 text-sm">Positive</span>
            </div>
            <div className="border-l border-gray-300 h-12 mx-4"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-semibold text-yellow-500">
                {neutralPercentage}%
              </span>
              <span className="text-gray-700 text-sm">Neutral</span>
            </div>
            <div className="border-l border-gray-300 h-12 mx-4"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-semibold text-red-500">
                {negativePercentage}%
              </span>
              <span className="text-gray-700 text-sm">Negative</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg bg-white rounded-2xl">
          <h3 className="text-gray-500 text-lg font-bold mb-1">
            Reaction Trends Over Time
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Analyzing the fluctuations in user reactions.
          </p>
          <BackToBackHistogram data={mockData} width={graphWidth} />
        </Card>
      </div>
    </div>
  );
};

export default MessageReactionsAnalytics;
