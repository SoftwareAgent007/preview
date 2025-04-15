import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface TrendIndicatorProps {
  value: number | string;
  unit?: string;
  isPositive?: boolean;
}

const TrendIndicator = ({ value, unit = "", isPositive = true }: TrendIndicatorProps) => {
  const color = isPositive ? "#22C55E" : "#EF4444";

  return (
    <div className="flex items-center gap-1">
      {isPositive ? (
        <ArrowUpIcon className="h-4 w-4" style={{ color }} />
      ) : (
        <ArrowDownIcon className="h-4 w-4" style={{ color }} />
      )}
      <span style={{ color }}>
        {isPositive ? "+" : "-"}{Math.abs(value)}
      </span>
      {unit && (
        <span style={{ color }}>
          {unit}
        </span>
      )}
    </div>
  );
};

export default TrendIndicator;

