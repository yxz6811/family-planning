import { AssignTaskForm } from "@/components/assign-task-form";
import { requireUser } from "@/lib/auth/session";
import { getTeamForUser } from "@/lib/services/team-service";
import { listAssignedByUser } from "@/lib/services/task-service";

export default async function AssignPage() {
  const user = await requireUser();
  const team = await getTeamForUser(user.id);
  const assignedTasks = await listAssignedByUser(user.id);
  const members =
    team?.members.map((m) => ({ id: m.id, displayName: m.displayName })) ??
    [];
  return (
    <AssignTaskForm
      members={members}
      currentUserId={user.id}
      assignedTasks={assignedTasks}
    />
  );
}
