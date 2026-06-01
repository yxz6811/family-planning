"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zh } from "@/lib/messages/zh";

interface AuthFormProps {
  mode: "login" | "register";
}

/**
 * 登录/注册表单
 */
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url =
      mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "login"
        ? { email, password }
        : { email, password, displayName };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? zh.errors.badRequest);
      return;
    }
    router.push("/tasks");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-xl bg-[var(--color-surface)] p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-semibold">
        {mode === "login" ? zh.auth.loginTitle : zh.auth.registerTitle}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <label className="flex flex-col gap-1 text-sm">
            {zh.auth.displayName}
            <input
              className="rounded-md border border-[var(--color-border)] px-3 py-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </label>
        )}
        <label className="flex flex-col gap-1 text-sm">
          {zh.auth.email}
          <input
            type="email"
            className="rounded-md border border-[var(--color-border)] px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {zh.auth.password}
          <input
            type="password"
            className="rounded-md border border-[var(--color-border)] px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "register" ? 8 : 1}
          />
        </label>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[var(--color-primary)] py-2 font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        >
          {mode === "login" ? zh.auth.loginSubmit : zh.auth.registerSubmit}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
        {mode === "login" ? (
          <>
            还没有账户？{" "}
            <Link href="/register" className="text-[var(--color-primary)]">
              {zh.nav.register}
            </Link>
          </>
        ) : (
          <>
            已有账户？{" "}
            <Link href="/login" className="text-[var(--color-primary)]">
              {zh.nav.login}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
