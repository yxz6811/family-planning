import { AuthForm } from "@/components/auth-form";
import { getCurrentUserId } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/tasks");
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <AuthForm mode="register" />
    </main>
  );
}
