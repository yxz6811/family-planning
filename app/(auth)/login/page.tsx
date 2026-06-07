import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/ui/auth-shell";
import { getCurrentUserId } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/tasks");
  return (
    <AuthShell>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
