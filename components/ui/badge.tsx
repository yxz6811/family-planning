import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "muted" | "cta";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--color-bg)] text-[var(--color-primary)] border border-[var(--color-border)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  muted: "bg-[var(--color-bg)] text-[var(--color-muted)]",
  cta: "bg-[color-mix(in_srgb,var(--color-cta)_18%,var(--color-surface))] text-[#8a6530] border border-[color-mix(in_srgb,var(--color-cta)_30%,transparent)]",
};

/**
 * 标签徽章
 */
export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
