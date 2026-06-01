import { requireUserApi } from "@/lib/auth/session";
import { jsonError } from "@/lib/api-response";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUserApi();
  if (!auth.ok) {
    return jsonError(auth.error, auth.status);
  }
  return NextResponse.json(auth.user);
}
