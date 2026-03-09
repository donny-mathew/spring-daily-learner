"use client";
import { useMemo } from "react";
import { AppProgress } from "@/types";
import { toYMD } from "@/lib/utils";

export function useStreak(progress: AppProgress) {
  return useMemo(() => {
    const log = progress.dailyLog;
    const today = new Date();
    let streak = 0;
    const date = new Date(today);

    // Check consecutive days ending today or yesterday
    while (true) {
      const key = toYMD(date);
      if (log[key]) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        break;
      }
    }

    // Last 30 days for heatmap
    const heatmap: { date: string; active: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toYMD(d);
      heatmap.push({ date: key, active: Boolean(log[key]) });
    }

    return { streak, heatmap };
  }, [progress.dailyLog]);
}
