import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "error";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variantClass = {
    default: "bg-[var(--badge-bg)] text-[var(--muted)]",
    success: "bg-green-500/20 text-green-400",
    warning: "bg-amber-500/20 text-amber-400",
    error: "bg-red-500/20 text-red-400",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClass,
        className
      )}
    >
      {children}
    </span>
  );
}
