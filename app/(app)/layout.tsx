import { NavBar } from "@/components/nav-bar";
import { requireUser } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <>
      <NavBar
        displayName={user.displayName}
        role={user.role}
        points={user.points}
      />
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </>
  );
}
