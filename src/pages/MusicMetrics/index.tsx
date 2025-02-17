import { faker } from "@faker-js/faker";
import BreadcrumbsNavigation from "@/components/common/BreadcrumbsNavigation";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { BREADCRUMB_PATHS, ROUTES } from "@/routes/routes.constant";
import TrendIndicator from "@/components/common/TrendIndicator";
import ListElement from "@/components/ui/list-element";
import HorizontalBarChartRelatedGenres from "@/components/charts/music/musicActivityChart";
import PeakListeningHoursChart from "@/components/charts/music/peackHoursChart";
import { useState } from "react";

const generateFakeStats = () => [
  { label: "Total Plays", value: faker.number.int({ min: 10000, max: 50000 }), change: faker.number.int({ min: -20, max: 20 }), isPositive: faker.datatype.boolean() },
  { label: "Unique Artists", value: faker.number.int({ min: 500, max: 1500 }), change: faker.number.int({ min: -20, max: 20 }), isPositive: faker.datatype.boolean() },
  { label: "Active Listeners", value: faker.number.int({ min: 1000, max: 5000 }), change: faker.number.int({ min: -20, max: 20 }), isPositive: faker.datatype.boolean() },
  { label: "Listenings while playing", value: faker.number.int({ min: 2000, max: 10000 }), change: faker.number.int({ min: -20, max: 20 }), isPositive: faker.datatype.boolean() },
];

const generateFakeArtists = () => 
  Array.from({ length: 5 }, () => ({
    name: faker.person.fullName(),
    plays: faker.number.int({ min: 1000, max: 10000 })
  }));

const generateFakeGenreData = () => {
  const totalCount = 800;
  const counts = Array.from({ length: 5 }, () => Math.floor(Math.random() * (totalCount / 5)));
  const sumCounts = counts.reduce((acc, count) => acc + count, 0);
  
  // Adjust the last count to ensure the total is exactly 800
  counts[counts.length - 1] += totalCount - sumCounts;

  return counts.map((count, i) => ({
    genre: faker.music.genre(),
    artist: faker.person.fullName(),
    count,
    total: totalCount
  }));
};

const generateListeningHoursData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    percentage: faker.number.int({ min: 10, max: 100 }), // Fake data for peak times
  }));
};

const generateSessionStats = () => {
  const currentSession = 135; // 2h 15m in minutes
  const previousSession = 115; // 1h 55m in minutes
  const change = ((currentSession - previousSession) / previousSession) * 100;
  return {
    current: currentSession,
    previous: previousSession,
    change,
    isPositive: change > 0,
  };
};

const MusicMetrics = () => {
  const stats = generateFakeStats();
  const topArtists = generateFakeArtists();
  const genreData = generateFakeGenreData();
  
  // Using state to store session stats
  const [sessionStats] = useState(generateSessionStats());

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="mx-auto" style={{ maxWidth: `${import.meta.env.VITE_MAX_WIDTH || 1200}px` }}>
        <div className="flex justify-between items-center mb-6">
          <BreadcrumbsNavigation items={BREADCRUMB_PATHS[ROUTES.MUSIC_METRICS]} />
        </div>
        
        {/* Upper Section */}
        <div className="upper-section flex gap-6 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="flex-1 p-6 h-30">
              <div className="h-full flex flex-col justify-between">
                <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
                <div className="flex-1 flex items-center">
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>{stat.change}% from last month</span>
                  <TrendIndicator unit={'%'} value={stat.change} isPositive={stat.isPositive} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div first-row-section className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-100">
            <div className="h-full flex flex-col">
              <span className="text-gray-500 text-lg font-bold mb-4">Top Played Artists</span>
              {topArtists.map((artist, index) => (
                <ListElement 
                  key={index} 
                  logo={<Users className="w-8 h-8 text-gray-600" />} 
                  title={artist.name} 
                  description={`${artist.plays} plays`} 
                  backgroundColor=""
                />
              ))}
            </div>
          </Card>
          <Card className="flex-1 p-6 h-100">
            <span className="text-gray-500 text-lg font-bold mb-4">Genre Preferences</span>
            <HorizontalBarChartRelatedGenres data={genreData.slice(0, 5)} width={500} height={370} />
          </Card>
        </div>

        <div className="flex gap-6 mb-6">
          <Card className="flex-1 p-6 h-100">
            <span className="text-gray-500 text-lg font-bold mb-4">Peak Listening Hours</span>
            <PeakListeningHoursChart data={generateListeningHoursData()}/>
          </Card>

          <Card className="flex-1 p-6 h-100 flex flex-col  items-center">
            <span className="text-gray-500 text-lg font-bold mb-20">Average Listening Session</span>
            <div className="flex flex-col justify-center items-center w-[90%]">
              <div className="text-blue-600 text-5xl font-bold">{Math.floor(sessionStats.current / 60)}h {sessionStats.current % 60}m</div>
              <span className="text-gray-500 text-sm">Per session</span>
              <div className="border-t border-gray-300 my-4 w-3/4"></div>
              <div className="flex justify-between items-center w-3/4">
                <span className="text-gray-500 text-sm">{`Previous: ${Math.floor(sessionStats.previous / 60)}h ${sessionStats.previous % 60}m`}</span>
                <TrendIndicator unit="%" value={Number(sessionStats.change.toFixed(1))} isPositive={sessionStats.isPositive} />
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default MusicMetrics;
