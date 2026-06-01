import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { zh } from "@/lib/messages/zh";

export interface SessionData {
  userId?: string;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ??
    "development-only-secret-min-32-chars-long!!",
  cookieName: "family_planning_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
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
  | { ok: true; user: { id: string; email: string; displayName: string; teamId: string | null } }
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
    },
  });
  if (!user) {
    return { ok: false, error: zh.errors.unauthorized, status: 401 };
  }
  return { ok: true, user };
}
