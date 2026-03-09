// News
export type NewsCategory = "spring-boot" | "spring-ai" | "spring-framework" | "java" | "general";
export type NewsSource = "spring-blog" | "github-releases";

export interface NewsItem {
  id: string;           // hash of URL — stable across re-fetches
  title: string;
  summary: string;      // max 200 chars
  url: string;
  publishedAt: string;  // ISO 8601
  source: NewsSource;
  category: NewsCategory;
  isRelease: boolean;
  version?: string;
}

// Progress (all in localStorage under "spring-learner-progress")
export interface AppProgress {
  newsProgress: { [itemId: string]: string | null };     // ISO date when read, or null
  lectureProgress: { [slug: string]: string | null };    // ISO date when complete, or null
  dailyLog: { [date: string]: boolean };                 // "YYYY-MM-DD" → true
  lastUpdated: string;
}

// Curriculum
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type CurriculumTier = 1 | 2 | 3 | 4;

export interface CurriculumTopic {
  id: number;
  slug: string;
  title: string;
  tier: CurriculumTier;
  difficulty: Difficulty;
  estimatedMinutes: number;
  overview: string;
  sections: LectureSection[];
  interviewQuestions: string[];
  furtherReading: { title: string; url: string }[];
}

export interface LectureSection {
  title: string;
  content?: string;
  code?: string;
  language?: string;
}
