import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-response";
import { createTeam, getTeamForUser } from "@/lib/services/team-service";
import { createTeamSchema } from "@/lib/validators";

export async function GET() {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const team = await getTeamForUser(auth.user.id);
  if (!team) {
    return NextResponse.json(null, { status: 404 });
  }
  return NextResponse.json(team);
}

export async function POST(request: Request) {
  const auth = await requireUserApi();
  if (!auth.ok) return jsonError(auth.error, auth.status);
  const body = await request.json().catch(() => ({}));
  const parsed = createTeamSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("请求无效", 400);
  }
  try {
    const team = await createTeam(auth.user.id, parsed.data.name);
    return NextResponse.json(team, { status: 201 });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "请求无效", 400);
  }
}
