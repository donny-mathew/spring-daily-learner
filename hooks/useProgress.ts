"use client";
import { useState, useEffect, useCallback } from "react";
import { AppProgress } from "@/types";
import { todayYMD } from "@/lib/utils";

const STORAGE_KEY = "spring-learner-progress";

const defaultProgress = (): AppProgress => ({
  newsProgress: {},
  lectureProgress: {},
  dailyLog: {},
  lastUpdated: new Date().toISOString(),
});

function loadProgress(): AppProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return JSON.parse(raw) as AppProgress;
  } catch {
    return defaultProgress();
  }
}

function saveProgress(p: AppProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, lastUpdated: new Date().toISOString() }));
  } catch {
    // storage full or unavailable — silently fail
  }
}

export function useProgress() {
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<AppProgress>(defaultProgress);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  const markNewsRead = useCallback((itemId: string) => {
    setProgress((prev) => {
      const today = todayYMD();
      const next: AppProgress = {
        ...prev,
        newsProgress: { ...prev.newsProgress, [itemId]: new Date().toISOString() },
        dailyLog: { ...prev.dailyLog, [today]: true },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const markNewsUnread = useCallback((itemId: string) => {
    setProgress((prev) => {
      const next: AppProgress = {
        ...prev,
        newsProgress: { ...prev.newsProgress, [itemId]: null },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const markLectureComplete = useCallback((slug: string) => {
    setProgress((prev) => {
      const today = todayYMD();
      const next: AppProgress = {
        ...prev,
        lectureProgress: { ...prev.lectureProgress, [slug]: new Date().toISOString() },
        dailyLog: { ...prev.dailyLog, [today]: true },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const markLectureIncomplete = useCallback((slug: string) => {
    setProgress((prev) => {
      const next: AppProgress = {
        ...prev,
        lectureProgress: { ...prev.lectureProgress, [slug]: null },
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const isNewsRead = useCallback(
    (itemId: string) => Boolean(progress.newsProgress[itemId]),
    [progress]
  );

  const isLectureComplete = useCallback(
    (slug: string) => Boolean(progress.lectureProgress[slug]),
    [progress]
  );

  return {
    hydrated,
    progress,
    markNewsRead,
    markNewsUnread,
    markLectureComplete,
    markLectureIncomplete,
    isNewsRead,
    isLectureComplete,
  };
}
