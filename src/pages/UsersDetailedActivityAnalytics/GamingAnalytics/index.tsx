import AreaLineChart from "@/components/charts/AreaLineChart";
import ErrorComponent from "@/components/common/errorModel";
import { Card } from "@/components/ui/card";
import { ClickableTooltip } from "@/components/ui/tooltip";
import { useGameDetails, useGamingStats } from "@/hooks/analytics/useGamingAnalytics";
import { useEffect, useRef, useState } from "react";
import ContentLoader from "react-content-loader";
import { TopGamesList } from "./components/topGamesList";
import { ActiveGamesList } from "./components/activeGamesList";

const CardSkeleton = ({ width, height }: { width: string; height: string }) => (
  <ContentLoader speed={2} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="100%" />
  </ContentLoader>
);

const GamingAnalytics = ({ guildId = "1w2dd" }) => {
  const { activeGames, popularGames, isLoading } = useGamingStats(guildId);
  const { gameStats, gameReport } = useGameDetails(guildId, "CS2");

  const {
    totalPlayers = 0,
    avgSessionMinutes = 0,
    peakPartySize = 0,
    totalHours = 0,
    weeklyTrends = []
  } = gameStats || {};

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [graphWidth, setGraphWidth] = useState(0);

  const updateGraphWidth = () => {
    if (wrapperRef.current) {
      setGraphWidth(wrapperRef.current.offsetWidth / 2.3);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateGraphWidth);
    return () => window.removeEventListener("resize", updateGraphWidth);
  }, []);

  useEffect(() => {
    if (wrapperRef.current) {
      updateGraphWidth();
    }
  }, [wrapperRef.current]);

  return (
    <div ref={wrapperRef} className="w-full bg-gray-50">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>

        {/* Player Statistics Cards */}
        <div className="flex gap-6 mb-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="flex-1 p-6 h-30">
                  <CardSkeleton width="100%" height="120" />
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card className="flex-1 p-6 h-30">
                <div className="h-full flex flex-col items-left justify-center">
                  <span className="text-gray-500 text-sm font-medium">Total Players</span>
                  <span className="text-2xl font-bold">{totalPlayers.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">Players in the game</span>
                </div>
              </Card>
              <Card className="flex-1 p-6 h-30">
                <div className="h-full flex flex-col items-left justify-center">
                  <span className="text-gray-500 text-sm font-medium">Avg. Session Time</span>
                  <span className="text-2xl font-bold">{avgSessionMinutes} min</span>
                  <span className="text-sm text-gray-500">Average session duration</span>
                </div>
              </Card>
              <Card className="flex-1 p-6 h-30">
                <div className="h-full flex flex-col items-left justify-center">
                  <span className="text-gray-500 text-sm font-medium">Peak Players</span>
                  <span className="text-2xl font-bold">{peakPartySize.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">Highest concurrent players</span>
                </div>
              </Card>
              <Card className="flex-1 p-6 h-30">
                <div className="h-full flex flex-col items-left justify-center">
                  <span className="text-gray-500 text-sm font-medium">Total Game Time</span>
                  <span className="text-2xl font-bold">{totalHours.toLocaleString()} hrs</span>
                  <span className="text-sm text-gray-500">Total hours played</span>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Main Gaming Data Grids */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="grid gap-6">
            {isLoading ? (
              <>
                <Card className="p-6"><CardSkeleton width="100%" height="500" /></Card>
                <Card className="p-6 h-[400px]"><CardSkeleton width="100%" height="350" /></Card>
              </>
            ) : (
              <>
                {popularGames.length > 0 ? (
                  <TopGamesList topGames={popularGames} />                  
                ) : (
                  <Card className="p-6 h-[400px]">
                    <ErrorComponent height={350} />
                  </Card>
                )}
                <Card className="p-6 h-[400px]">
                  {weeklyTrends?.length > 0 ? (
                    <AreaLineChart data={weeklyTrends} width={graphWidth} height={300} graphColor="#b1c4f5" />
                  ) : (
                    <ErrorComponent height={350} />
                  )}
                </Card>
              </>
            )}
          </div>

          {/* Active Games Section */}
          <div className="grid grid-rows-8 gap-6 h-[1000px]">
            {isLoading ? (
              <Card className="p-6 row-span-5"><CardSkeleton width="100%" height="550" /></Card>
            ) : (
              <Card className="p-6 row-span-5">
                <div className="title text-gray-500 text-lg font-bold mb-4 ">
                  <span className="mr-5">Active Games</span>
                  <ClickableTooltip content={<p><strong>Active Games: </strong> Current active games being played.</p>}>
                    <span className="bg-gray-300 bg-opacity-25 text-gray-600 px-[7px] rounded-full cursor-help">?</span>
                  </ClickableTooltip>
                </div>
                {activeGames?.length > 0 ? (
                  <ActiveGamesList topGames={activeGames} />
                ) : (
                  <ErrorComponent height={530} />
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamingAnalytics;
