"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/cn";
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
  const [role, setRole] = useState<"parent" | "child">("parent");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url = withBasePath(
      mode === "login" ? "/api/auth/login" : "/api/auth/register"
    );
    const body =
      mode === "login"
        ? { email, password }
        : { email, password, displayName, role };
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
    <Card className="w-full max-w-md p-8">
      <h2 className="font-heading mb-6 text-2xl font-semibold">
        {mode === "login" ? zh.auth.loginTitle : zh.auth.registerTitle}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <>
            <Field label={zh.auth.displayName}>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </Field>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium text-[var(--color-text)]">
                {zh.auth.role}
              </legend>
              <div className="flex gap-2">
                {(["parent", "child"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "interactive focus-ring flex-1 rounded-[var(--radius-sm)] border-2 px-3 py-2 text-sm",
                      role === r
                        ? "border-[var(--color-primary)] bg-[var(--color-bg)] font-medium text-[var(--color-primary)]"
                        : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-secondary)]"
                    )}
                  >
                    {r === "parent" ? zh.auth.roleParent : zh.auth.roleChild}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}
        <Field label={zh.auth.email}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label={zh.auth.password}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "register" ? 8 : 1}
          />
        </Field>
        {error && (
          <p className="rounded-[var(--radius-sm)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {mode === "login" ? zh.auth.loginSubmit : zh.auth.registerSubmit}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
        {mode === "login" ? (
          <>
            还没有账户？{" "}
            <Link
              href="/register"
              className="interactive font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              {zh.nav.register}
            </Link>
          </>
        ) : (
          <>
            已有账户？{" "}
            <Link
              href="/login"
              className="interactive font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              {zh.nav.login}
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
