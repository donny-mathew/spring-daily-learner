import { NewsCategory } from "@/types";

export const CATEGORY_CONFIG: Record<NewsCategory, { label: string; color: string; border: string; bg: string; text: string }> = {
  "spring-boot": {
    label: "Spring Boot",
    color: "#6db33f",
    border: "border-l-[#6db33f]",
    bg: "bg-[#6db33f]/10",
    text: "text-[#6db33f]",
  },
  "spring-ai": {
    label: "Spring AI",
    color: "#a855f7",
    border: "border-l-purple-500",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
  },
  "spring-framework": {
    label: "Spring Framework",
    color: "#3b82f6",
    border: "border-l-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
  },
  java: {
    label: "Java",
    color: "#f59e0b",
    border: "border-l-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
  },
  general: {
    label: "General",
    color: "#6b7280",
    border: "border-l-gray-500",
    bg: "bg-gray-500/10",
    text: "text-gray-400",
  },
};

export const DIFFICULTY_CONFIG = {
  beginner: { label: "Beginner", bg: "bg-green-500/20", text: "text-green-400" },
  intermediate: { label: "Intermediate", bg: "bg-amber-500/20", text: "text-amber-400" },
  advanced: { label: "Advanced", bg: "bg-red-500/20", text: "text-red-400" },
};

export const TIER_LABELS: Record<number, string> = {
  1: "Fundamentals",
  2: "Microservices & Messaging",
  3: "Advanced Systems",
  4: "Spring AI & Modern Java",
};
