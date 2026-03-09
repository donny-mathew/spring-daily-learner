"use client";
import { NewsItem } from "@/types";
import { CATEGORY_CONFIG } from "@/data/categories";
import { formatRelativeDate, cn } from "@/lib/utils";
import { ReadToggle } from "@/components/shared/ReadToggle";
import { Badge } from "@/components/shared/Badge";

interface NewsCardProps {
  item: NewsItem;
  isRead: boolean;
  onToggleRead: () => void;
}

export function NewsCard({ item, isRead, onToggleRead }: NewsCardProps) {
  const cat = CATEGORY_CONFIG[item.category];

  return (
    <article
      className={cn(
        "group rounded-xl border border-l-4 border-[var(--border)] bg-[var(--card-bg)] p-4 transition-all hover:border-[var(--border-hover)]",
        cat.border,
        isRead && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className={cn("text-xs font-medium", cat.text)}>{cat.label}</span>
            {item.isRelease && (
              <Badge className="bg-[#6db33f]/20 text-[#6db33f]">Release</Badge>
            )}
            {item.version && (
              <Badge className="font-mono">{item.version}</Badge>
            )}
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-[var(--foreground)] hover:text-[#6db33f] transition-colors leading-snug"
          >
            {item.title}
          </a>

          {item.summary && (
            <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
              {item.summary}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-[var(--muted)]">
          {formatRelativeDate(item.publishedAt)}
          {" · "}
          {item.source === "spring-blog" ? "Spring Blog" : "GitHub Releases"}
        </span>
        <ReadToggle isRead={isRead} onToggle={onToggleRead} />
      </div>
    </article>
  );
}
