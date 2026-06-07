"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { withBasePath } from "@/lib/base-path";
import { isParentRole } from "@/lib/constants/product";
import { roleLabel, zh } from "@/lib/messages/zh";

interface NavBarProps {
  displayName: string;
  role: string;
  points: number;
}

/**
 * 顶部导航与退出
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
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-lg font-semibold text-[var(--color-primary)]">
              {zh.appName}
            </span>
            <p className="text-xs text-[var(--color-muted)]">{zh.tagline}</p>
          </div>
          <nav className="flex gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname.includes(link.href)
                    ? "font-medium text-[var(--color-primary)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs text-[var(--color-primary)]">
            {roleLabel(role)} · {points} {zh.nav.points}
          </span>
          <span className="text-[var(--color-muted)]">{displayName}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md px-3 py-1 text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
          >
            {zh.nav.logout}
          </button>
        </div>
      </div>
    </header>
  );
}
