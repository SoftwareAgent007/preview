import SentimentChart from "@/components/charts/reactions/reactionsBalanceChart";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import { useEffect, useRef, useState } from "react";

const MessageReactionsAnalytics = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [graphWidth, setGraphWidth] = useState(0);
  const height = 400;

  const updateGraphWidth = () => {
    if (wrapperRef.current) {
      setGraphWidth(wrapperRef.current.offsetWidth - 40);
      console.log('setGraphWidth',wrapperRef.current.offsetWidth - 40)
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateGraphWidth);
    updateGraphWidth(); // Call on mount to set initial dimensions

    return () => window.removeEventListener("resize", updateGraphWidth);
  }, []);

  const mockData = [
    { date: "2024-11-21", positive: 150, neutral: 50, negative: -30 },
    { date: "2024-11-22", positive: 200, neutral: 60, negative: -40 },
    { date: "2024-11-23", positive: 180, neutral: 55, negative: -35 },
    { date: "2024-11-24", positive: 220, neutral: 65, negative: -50 },
    { date: "2024-11-25", positive: 170, neutral: 45, negative: -20 },
    { date: "2024-11-26", positive: 210, neutral: 70, negative: -45 },
    { date: "2024-11-27", positive: 190, neutral: 60, negative: -30 },
    { date: "2024-11-28", positive: 250, neutral: 80, negative: -55 },
    { date: "2024-11-29", positive: 160, neutral: 40, negative: -25 },
    { date: "2024-11-26", positive: 210, neutral: 70, negative: -45 },
    { date: "2024-11-27", positive: 190, neutral: 60, negative: -30 },
    { date: "2024-11-28", positive: 250, neutral: 80, negative: -55 },
    { date: "2024-11-29", positive: 160, neutral: 40, negative: -25 },
  ];
  

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div ref={wrapperRef} className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.MESSAGE_REACTIONS]} />

        <SentimentChart data={mockData} width={graphWidth} height={height} />
      </div>
    </div>
  );
};

export default MessageReactionsAnalytics;
