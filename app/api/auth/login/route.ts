import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { zh } from "@/lib/messages/zh";
import { loginSchema } from "@/lib/validators";
import { jsonError } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(zh.auth.required, 400);
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError(zh.auth.invalidCredentials, 401);
  }
  const session = await getSession();
  session.userId = user.id;
  await session.save();
  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    teamId: user.teamId,
  });
}
