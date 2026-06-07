import { CheckCircle2, ListTodo } from "lucide-react";
import { TaskCard, type TaskItem } from "@/components/task-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { zh } from "@/lib/messages/zh";

interface TaskBoardProps {
  pending: TaskItem[];
  done: TaskItem[];
}

/**
 * 上下双区任务栏
 */
export function TaskBoard({ pending, done }: TaskBoardProps) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-[var(--color-primary)]" aria-hidden />
          <h2 className="font-heading text-lg font-semibold">{zh.taskBoard.pending}</h2>
          <Badge variant="default">{pending.length}</Badge>
        </div>
        {pending.length === 0 ? (
          <EmptyState message={zh.taskBoard.emptyPending} />
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} zone="pending" />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" aria-hidden />
          <h2 className="font-heading text-lg font-semibold">{zh.taskBoard.done}</h2>
          <Badge variant="success">{done.length}</Badge>
        </div>
        {done.length === 0 ? (
          <EmptyState message={zh.taskBoard.emptyDone} />
        ) : (
          <ul className="flex flex-col gap-3">
            {done.map((task) => (
              <li key={task.id}>
                <TaskCard task={task} zone="done" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
