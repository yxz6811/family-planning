import { cn } from "@/lib/cn";

interface EmptyStateProps {
  message: string;
  className?: string;
}

/**
 * 空状态占位
 */
export function EmptyState({ message, className }: EmptyStateProps) {
  return (
    <p
      className={cn(
        "rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-muted)]",
        className
      )}
    >
      {message}
    </p>
  );
}
