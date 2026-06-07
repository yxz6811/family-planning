import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { zh } from "@/lib/messages/zh";

export interface SessionData {
  userId?: string;
}

const DEV_FALLBACK_SECRET = "development-session-secret-at-least-32-chars";

/**
 * 生成满足 iron-session 长度要求的密码。
 */
function resolveSessionSecret(): string {
  const raw = process.env.SESSION_SECRET?.trim();

  if (raw && raw.length >= 32) {
    return raw;
  }

  if (raw && raw.length > 0) {
    return raw.padEnd(32, "_");
  }

  return DEV_FALLBACK_SECRET;
}

const cookiePath =
  process.env.SESSION_COOKIE_PATH ??
  (process.env.NEXT_PUBLIC_BASE_PATH || "/");

export const sessionOptions: SessionOptions = {
  password: resolveSessionSecret(),
  cookieName: "family_planning_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: cookiePath,
    maxAge: 60 * 60 * 24 * 14,
  },
};

/**
 * 获取当前 iron-session
 */
export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * 获取已登录用户 ID，未登录返回 null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session.userId ?? null;
}

/**
 * 要求登录，否则重定向登录页
 */
export async function requireUser() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      teamId: true,
      role: true,
      points: true,
    },
  });
  if (!user) {
    const session = await getSession();
    session.destroy();
    redirect("/login");
  }
  return user;
}

/**
 * API 路由用：未登录抛错对象
 */
export type ApiAuthResult =
  | {
      ok: true;
      user: {
        id: string;
        email: string;
        displayName: string;
        teamId: string | null;
        role: string;
        points: number;
      };
    }
  | { ok: false; error: string; status: number };

/**
 * API 路由鉴权
 */
export async function requireUserApi(): Promise<ApiAuthResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { ok: false, error: zh.errors.unauthorized, status: 401 };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      teamId: true,
      role: true,
      points: true,
    },
  });
  if (!user) {
    return { ok: false, error: zh.errors.unauthorized, status: 401 };
  }
  return { ok: true, user };
}
