import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
  secondary:
    "border-2 border-[var(--color-primary)] bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-bg)]",
  success:
    "bg-[var(--color-success)] text-white hover:opacity-90",
  danger:
    "bg-[var(--color-danger)] text-white hover:opacity-90",
  ghost:
    "bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm font-medium",
};

/**
 * 统一按钮样式，符合 Flat Design 规范
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "interactive focus-ring inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
