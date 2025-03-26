import { useMemo } from "react";
import { useQuery } from "react-query";
import { apiService } from "../apiService";
import { PeakHour } from "@/types/dataTypes";

export const usePeakHours = (
  period: "day" | "week" | "month" | "year" = "year",
  limit: number = 5
) => {
  const getPeriodStart = useMemo(() => {
    const now = new Date();
    switch (period) {
      case "day":
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case "week":
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case "year":
      default:
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
    }
  }, [period]);

  const requestParams = {
    startDate: getPeriodStart,
    endDate: new Date().toISOString(),
    limit,
  };

  const {
    data: peakHours,
    isLoading,
    error,
  } = useQuery<PeakHour[]>(
    ["peakHours", period, limit],
    (guildId) =>
      apiService.getData(
        `/presence-activity/peak-hours?guildId=${guildId}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}&limit=${limit}`
      ),
    {
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    }
  );

  return {
    peakHours: peakHours,
    isLoading,
    error,
  };
};
