"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zh } from "@/lib/messages/zh";

export interface TaskItem {
  id: string;
  kind: string;
  kindLabel: string;
  content: string;
  durationMinutes: number;
  status: string;
  assignerName: string;
  assigneeName: string;
}

interface TaskCardProps {
  task: TaskItem;
  zone: "pending" | "done";
}

/**
 * 单条任务卡片与操作按钮
 */
export function TaskCard({ task, zone }: TaskCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    await fetch(`/api/tasks/${task.id}/complete`, { method: "PATCH" });
    setLoading(false);
    router.refresh();
  }

  async function handleApproval() {
    setLoading(true);
    const res = await fetch(`/api/tasks/${task.id}/request-approval`, {
      method: "PATCH",
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  const showComplete =
    zone === "pending" &&
    task.status === "PENDING" &&
    (task.kind === "COURSE" || task.kind === "SPORT" || task.kind === "APPROVAL");

  const showApproval =
    zone === "pending" &&
    task.status === "PENDING" &&
    task.kind === "HOMEWORK";

  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
          {task.kindLabel}
        </span>
        <span className="text-xs text-[var(--color-muted)]">
          {task.durationMinutes} {zh.taskBoard.minutes}
        </span>
      </div>
      <p className="mb-2 text-[var(--color-text)]">{task.content}</p>
      <p className="mb-3 text-xs text-[var(--color-muted)]">
        {zh.taskBoard.from} {task.assignerName}
        {task.status === "SUBMITTED" && (
          <span className="ml-2 text-[var(--color-success)]">
            · {zh.taskBoard.submittedLabel}
          </span>
        )}
      </p>
      {showComplete && (
        <button
          type="button"
          disabled={loading}
          onClick={handleComplete}
          className="rounded-md bg-[var(--color-success)] px-4 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-60"
        >
          {zh.taskBoard.complete}
        </button>
      )}
      {showApproval && (
        <button
          type="button"
          disabled={loading}
          onClick={handleApproval}
          className="rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-sm text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        >
          {zh.taskBoard.requestApproval}
        </button>
      )}
    </article>
  );
}
