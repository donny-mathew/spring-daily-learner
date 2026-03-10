"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<AppProgress>(defaultProgress);
  const patchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load progress: from API when authenticated, localStorage otherwise
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.id) {
      fetch("/api/progress")
        .then((r) => r.json())
        .then((data: AppProgress) => {
          setProgress(data);
          setHydrated(true);
        })
        .catch(() => {
          setProgress(loadProgress());
          setHydrated(true);
        });
    } else {
      setProgress(loadProgress());
      setHydrated(true);
    }
  }, [session?.user?.id, status]);

  const persistProgress = useCallback(
    (next: AppProgress) => {
      if (session?.user?.id) {
        // Optimistic: also keep localStorage as offline cache
        saveProgress(next);
        // Debounced PATCH to API
        if (patchTimer.current) clearTimeout(patchTimer.current);
        patchTimer.current = setTimeout(() => {
          fetch("/api/progress", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          }).catch(() => {});
        }, 1000);
      } else {
        saveProgress(next);
      }
    },
    [session?.user?.id]
  );

  const markNewsRead = useCallback(
    (itemId: string) => {
      setProgress((prev) => {
        const today = todayYMD();
        const next: AppProgress = {
          ...prev,
          newsProgress: { ...prev.newsProgress, [itemId]: new Date().toISOString() },
          dailyLog: { ...prev.dailyLog, [today]: true },
        };
        persistProgress(next);
        return next;
      });
    },
    [persistProgress]
  );

  const markNewsUnread = useCallback(
    (itemId: string) => {
      setProgress((prev) => {
        const next: AppProgress = {
          ...prev,
          newsProgress: { ...prev.newsProgress, [itemId]: null },
        };
        persistProgress(next);
        return next;
      });
    },
    [persistProgress]
  );

  const markLectureComplete = useCallback(
    (slug: string) => {
      setProgress((prev) => {
        const today = todayYMD();
        const next: AppProgress = {
          ...prev,
          lectureProgress: { ...prev.lectureProgress, [slug]: new Date().toISOString() },
          dailyLog: { ...prev.dailyLog, [today]: true },
        };
        persistProgress(next);
        return next;
      });
    },
    [persistProgress]
  );

  const markLectureIncomplete = useCallback(
    (slug: string) => {
      setProgress((prev) => {
        const next: AppProgress = {
          ...prev,
          lectureProgress: { ...prev.lectureProgress, [slug]: null },
        };
        persistProgress(next);
        return next;
      });
    },
    [persistProgress]
  );

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
