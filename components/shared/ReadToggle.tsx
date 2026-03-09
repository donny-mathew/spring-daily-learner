"use client";
import { cn } from "@/lib/utils";

interface ReadToggleProps {
  isRead: boolean;
  onToggle: () => void;
  className?: string;
}

export function ReadToggle({ isRead, onToggle, className }: ReadToggleProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        isRead
          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
          : "bg-[var(--hover)] text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]",
        className
      )}
      aria-label={isRead ? "Mark as unread" : "Mark as read"}
    >
      {isRead ? (
        <>
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Read
        </>
      ) : (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Mark read
        </>
      )}
    </button>
  );
}
