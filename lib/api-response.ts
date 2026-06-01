import { NextResponse } from "next/server";

/**
 * JSON 错误响应（中文 message）
 */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
