import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-response";
import {
  listPendingInvitationsForUser,
  sendInvitation,
} from "@/lib/services/team-service";
import { inviteSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const list = await listPendingInvitationsForUser(auth.user.id);
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("邮箱格式不正确", 400);
  }
  try {
    const inv = await sendInvitation(
      auth.user.id,
      parsed.data.inviteeEmail
    );
    return NextResponse.json(inv, { status: 201 });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "请求无效", 400);
  }
}
