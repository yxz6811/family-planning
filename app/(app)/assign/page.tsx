import { redirect } from "next/navigation";
import { AssignTaskForm } from "@/components/assign-task-form";
import { isParentRole } from "@/lib/constants/product";
import { requireUser } from "@/lib/auth/session";
import { getTeamForUser } from "@/lib/services/team-service";
import { listAssignedByUser } from "@/lib/services/task-service";

export default async function AssignPage() {
  const user = await requireUser();
  if (!isParentRole(user.role)) {
    redirect("/tasks");
  }
  const team = await getTeamForUser(user.id);
  const assignedTasks = await listAssignedByUser(user.id);
  const members =
    team?.members.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      role: m.role,
    })) ?? [];
  return (
    <AssignTaskForm
      members={members}
      currentUserId={user.id}
      assignedTasks={assignedTasks}
    />
  );
}
