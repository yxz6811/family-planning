import { TaskCard, type TaskItem } from "@/components/task-card";
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
        <h2 className="mb-3 text-lg font-semibold">{zh.taskBoard.pending}</h2>
        {pending.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-muted)]">
            {zh.taskBoard.emptyPending}
          </p>
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
        <h2 className="mb-3 text-lg font-semibold">{zh.taskBoard.done}</h2>
        {done.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--color-border)] p-6 text-center text-[var(--color-muted)]">
            {zh.taskBoard.emptyDone}
          </p>
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
