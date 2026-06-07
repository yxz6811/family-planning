import { HeartHandshake } from "lucide-react";
import { zh } from "@/lib/messages/zh";

interface AuthShellProps {
  children: React.ReactNode;
}

/**
 * 登录/注册页外壳：品牌区 + 表单卡片
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 md:flex-row md:gap-12">
      <div className="max-w-sm text-center md:text-left">
        <div className="mb-4 inline-flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-3 text-[var(--color-primary)]">
          <HeartHandshake className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="font-heading text-3xl font-bold text-[var(--color-text)]">
          {zh.appName}
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">{zh.tagline}</p>
      </div>
      {children}
    </main>
  );
}
