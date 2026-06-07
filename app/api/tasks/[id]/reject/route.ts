import { requireUserApi } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-response";
import { rejectHomework } from "@/lib/services/task-service";
import { rejectHomeworkSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const body = await request.json().catch(() => ({}));
  const parsed = rejectHomeworkSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("请求无效", 400);
  }
  const { id } = await params;
  try {
    const task = await rejectHomework(
      id,
      auth.user.id,
      parsed.data.rejectionNote
    );
    return NextResponse.json(task);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "请求无效";
    return jsonError(msg, msg.includes("无权") ? 403 : 400);
  }
}
