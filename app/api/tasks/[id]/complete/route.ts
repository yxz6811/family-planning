import { requireUserApi } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-response";
import { completeTask } from "@/lib/services/task-service";
import { NextResponse } from "next/server";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const { id } = await params;
  try {
    const task = await completeTask(id, auth.user.id);
    return NextResponse.json(task);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "请求无效";
    const status = msg.includes("无权") ? 403 : 400;
    return jsonError(msg, status);
  }
}
