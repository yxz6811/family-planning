import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { zh } from "@/lib/messages/zh";
import { registerSchema } from "@/lib/validators";
import { jsonError } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? zh.auth.required, 400);
  }
  const { email, password, displayName, role } = parsed.data;
  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    return jsonError(zh.auth.emailExists, 400);
  }
  const passwordHash = await hashPassword(password);
  const userRole =
    role === "parent" ? UserRole.ADMIN : UserRole.EXECUTOR;
  const user = await prisma.user.create({
    data: {
      email: normalized,
      passwordHash,
      displayName: displayName.trim(),
      role: userRole,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      teamId: true,
      role: true,
      points: true,
    },
  });
  const session = await getSession();
  session.userId = user.id;
  await session.save();
  return NextResponse.json(user, { status: 201 });
}
