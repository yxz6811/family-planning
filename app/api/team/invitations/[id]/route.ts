import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-response";
import { respondToInvitation } from "@/lib/services/team-service";
import { invitationActionSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const body = await request.json();
  const parsed = invitationActionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("请求无效", 400);
  }
  const { id } = await params;
  try {
    const inv = await respondToInvitation(
      auth.user.id,
      id,
      parsed.data.action
    );
    return NextResponse.json(inv);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "请求无效", 400);
  }
}
