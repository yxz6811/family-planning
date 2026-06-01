import { TaskBoard } from "@/components/task-board";
import { requireUser } from "@/lib/auth/session";
import { getTaskBoard } from "@/lib/services/task-service";

export default async function TasksPage() {
  const user = await requireUser();
  const board = await getTaskBoard(user.id);
  return <TaskBoard pending={board.pending} done={board.done} />;
}
