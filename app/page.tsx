import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/session";

/**
 * 根路径重定向至任务栏或登录
 */
export default async function HomePage() {
  const userId = await getCurrentUserId();
  redirect(userId ? "/tasks" : "/login");
}
