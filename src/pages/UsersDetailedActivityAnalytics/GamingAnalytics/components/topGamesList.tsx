import { Card } from "@/components/ui/card";

const colors = ["#4F46E5", "#F59E0B", "#10B981"];

const TopGamesList = ({ topGames }: { topGames: { game: string; hoursPlayed: number }[] }) => {
  const sortedGames = [...topGames].sort((a, b) => b.hoursPlayed - a.hoursPlayed).slice(0, 3);
  const maxHours = sortedGames[0]?.hoursPlayed || 1;

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4 height-100 text-gray-700">Top Games</h2>
      <ul className="space-y-3">
        {sortedGames.map((game, index) => (
          <li key={index} className="flex flex-col">
            <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
              <span>{game.game}</span>
              <span>{game.hoursPlayed} hrs</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: "#E5E7EB" }}>
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(game.hoursPlayed / maxHours) * 100}%`,
                  backgroundColor: colors[index % colors.length],
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export { TopGamesList };
