"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zh } from "@/lib/messages/zh";
import type { TaskItem } from "@/components/task-card";

interface Member {
  id: string;
  displayName: string;
}

interface AssignTaskFormProps {
  members: Member[];
  currentUserId: string;
  assignedTasks: TaskItem[];
}

/**
 * 分发任务表单与已分发列表
 */
export function AssignTaskForm({
  members,
  currentUserId,
  assignedTasks,
}: AssignTaskFormProps) {
  const router = useRouter();
  const others = members.filter((m) => m.id !== currentUserId);
  const [kind, setKind] = useState<"COURSE" | "SPORT" | "HOMEWORK">("COURSE");
  const [content, setContent] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [assigneeId, setAssigneeId] = useState(others[0]?.id ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        content,
        durationMinutes: Number(durationMinutes),
        assigneeId,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? zh.errors.badRequest);
      return;
    }
    setSuccess(zh.assign.success);
    setContent("");
    router.refresh();
  }

  if (others.length === 0) {
    return (
      <p className="text-[var(--color-muted)]">
        请先邀请其他成员加入团队后再分发任务。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-[var(--color-surface)] p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">{zh.assign.title}</h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            {zh.assign.kind}
            <select
              className="rounded-md border border-[var(--color-border)] px-3 py-2"
              value={kind}
              onChange={(e) =>
                setKind(e.target.value as "COURSE" | "SPORT" | "HOMEWORK")
              }
            >
              <option value="COURSE">{zh.taskKind.COURSE}</option>
              <option value="SPORT">{zh.taskKind.SPORT}</option>
              <option value="HOMEWORK">{zh.taskKind.HOMEWORK}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {zh.assign.content}
            <textarea
              className="rounded-md border border-[var(--color-border)] px-3 py-2"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {zh.assign.duration}
            <input
              type="number"
              min={1}
              max={480}
              className="rounded-md border border-[var(--color-border)] px-3 py-2"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {zh.assign.assignee}
            <select
              className="rounded-md border border-[var(--color-border)] px-3 py-2"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {others.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-[var(--color-success)]">{success}</p>
          )}
          <button
            type="submit"
            className="rounded-md bg-[var(--color-primary)] py-2 font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            {zh.assign.submit}
          </button>
        </div>
      </form>

      {assignedTasks.length > 0 && (
        <section>
          <h3 className="mb-3 font-semibold">我分发的任务</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {assignedTasks.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
              >
                <span className="font-medium">{t.kindLabel}</span> →{" "}
                {t.assigneeName} · {t.status === "PENDING" ? "未完成" : t.status === "SUBMITTED" ? "已提交审批" : "已完成"}
                <p className="mt-1 text-[var(--color-muted)]">{t.content}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
