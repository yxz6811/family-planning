"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, LogOut, PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { withBasePath } from "@/lib/base-path";
import { isParentRole } from "@/lib/constants/product";
import { cn } from "@/lib/cn";
import { roleLabel, zh } from "@/lib/messages/zh";

interface NavBarProps {
  displayName: string;
  role: string;
  points: number;
}

const linkIcons = {
  "/tasks": ClipboardList,
  "/team": Users,
  "/assign": PlusCircle,
} as const;

/**
 * 顶部浮动导航与退出
 */
export function NavBar({ displayName, role, points }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/tasks", label: zh.nav.tasks },
    { href: "/team", label: zh.nav.team },
    ...(isParentRole(role)
      ? [{ href: "/assign", label: zh.nav.assign }]
      : []),
  ];

  async function handleLogout() {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto max-w-3xl rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="font-heading text-lg font-semibold text-[var(--color-primary)]">
                {zh.appName}
              </span>
              <p className="text-xs text-[var(--color-muted)]">{zh.tagline}</p>
            </div>
            <nav className="flex gap-1" aria-label="主导航">
              {links.map((link) => {
                const Icon = linkIcons[link.href as keyof typeof linkIcons];
                const active = pathname.includes(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "interactive focus-ring inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm",
                      active
                        ? "bg-[var(--color-bg)] font-medium text-[var(--color-primary)]"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" aria-hidden />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="cta">
              {roleLabel(role)} · {points} {zh.nav.points}
            </Badge>
            <span className="hidden text-[var(--color-muted)] sm:inline">
              {displayName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              aria-label={zh.nav.logout}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="sr-only sm:not-sr-only sm:ml-1">{zh.nav.logout}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
