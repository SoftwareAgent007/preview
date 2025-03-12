import { useMemo } from "react";
import { useQuery } from "react-query";
import { apiService } from "../apiService";
import { PeakHour } from "@/types/dataTypes";

export const usePeakHours = (
  guildId: string,
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
    guildId,
    startDate: getPeriodStart,
    endDate: new Date().toISOString(),
    limit,
  };

  const {
    data: peakHours,
    isLoading,
    error,
  } = useQuery<PeakHour[]>(
    ["peakHours", guildId, period, limit],
    () =>
      apiService.getData(
        `/presence-activity/peak-hours?guildId=${323644524268093441}&startDate=${requestParams.startDate}&endDate=${requestParams.endDate}&limit=${limit}`
      ),
    {
      staleTime: 1000 * 60 * 30,
      cacheTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    }
  );
  
  // if (!error) {
  //   peakHours?.sort((a, b) => a.playerCount - b.playerCount)
  // }

  return {
    peakHours: peakHours,
    isLoading,
    error,
  };
};
