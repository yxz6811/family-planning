import { requireUserApi } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-response";
import { requestHomeworkApproval } from "@/lib/services/task-service";
import { NextResponse } from "next/server";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const { id } = await params;
  try {
    const result = await requestHomeworkApproval(id, auth.user.id);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "请求无效";
    if (msg.includes("已存在")) return jsonError(msg, 409);
    const status = msg.includes("无权") ? 403 : 400;
    return jsonError(msg, status);
  }
}
