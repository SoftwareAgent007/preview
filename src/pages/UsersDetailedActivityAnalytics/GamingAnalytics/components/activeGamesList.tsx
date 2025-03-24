import { Card } from "@/components/ui/card";
import { ActiveGame } from "@/types/dataTypes";

const colors = ["#4F46E5", "#F59E0B", "#10B981"];

const ActiveGamesList = ({ topGames }: { topGames: ActiveGame[] | undefined }) => {
  if (!topGames) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-4 height-100 text-gray-700">Top Games</h2>
        <div className="text-sm text-gray-500">No data available</div>
      </Card>
    );
  }

  const sortedGames = [...topGames].sort((a, b) => b.playerCount - a.playerCount).slice(0, 3);
  const maxHours = sortedGames[0]?.playerCount || 1;

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4 height-100 text-gray-700">Top Games</h2>
      <ul className="space-y-3">
        {sortedGames.map((game, index) => (
          <li key={index} className="flex flex-col">
            <div className="flex justify-between text-sm font-semibold text-gray-800 mb-1">
              <span>{game.gameName}</span>
              <span>{game.playerCount} hrs</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: "#E5E7EB" }}>
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(game.playerCount / maxHours) * 100}%`,
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

export { ActiveGamesList };
