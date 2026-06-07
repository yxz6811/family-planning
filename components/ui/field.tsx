import { cn } from "@/lib/cn";

const controlClass =
  "focus-ring w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * 表单字段容器（标签 + 控件）
 */
export function Field({ label, children, className }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-sm font-medium", className)}>
      <span className="text-[var(--color-text)]">{label}</span>
      {children}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * 文本输入框
 */
export function Input({ className, ...props }: InputProps) {
  return <input className={cn(controlClass, className)} {...props} />;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * 多行文本框
 */
export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(controlClass, "resize-y", className)} {...props} />;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * 下拉选择框
 */
export function Select({ className, ...props }: SelectProps) {
  return <select className={cn(controlClass, "cursor-pointer", className)} {...props} />;
}
