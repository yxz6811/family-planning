import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-response";
import {
  createTask,
  getTaskBoard,
} from "@/lib/services/task-service";
import { createTaskSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const board = await getTaskBoard(auth.user.id);
  return NextResponse.json(board);
}

export async function POST(request: Request) {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.errors[0]?.message ?? "请求无效",
      400
    );
  }
  try {
    const task = await createTask(auth.user.id, parsed.data);
    return NextResponse.json(task, { status: 201 });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "请求无效", 400);
  }
}
