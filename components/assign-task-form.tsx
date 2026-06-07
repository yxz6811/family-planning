"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SUBJECT_TAGS, defaultPointsForKind } from "@/lib/constants/product";
import { withBasePath } from "@/lib/base-path";
import { zh } from "@/lib/messages/zh";
import type { TaskItem } from "@/components/task-card";

interface Member {
  id: string;
  displayName: string;
  role?: string;
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
  const children = others.filter(
    (m) => !m.role || m.role === "EXECUTOR"
  );
  const [kind, setKind] = useState<"COURSE" | "SPORT" | "HOMEWORK">("HOMEWORK");
  const [subjectTag, setSubjectTag] = useState<string>(SUBJECT_TAGS[1]);
  const [content, setContent] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [pointsReward, setPointsReward] = useState(10);
  const [assigneeId, setAssigneeId] = useState(children[0]?.id ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch(withBasePath("/api/tasks"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        content,
        durationMinutes: Number(durationMinutes),
        assigneeId,
        subjectTag,
        pointsReward: Number(pointsReward),
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

  if (children.length === 0) {
    return (
      <p className="text-[var(--color-muted)]">
        请先邀请孩子加入家庭后再布置任务。
      </p>
    );
  }

  function onKindChange(next: "COURSE" | "SPORT" | "HOMEWORK") {
    setKind(next);
    setPointsReward(defaultPointsForKind(next));
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
                onKindChange(
                  e.target.value as "COURSE" | "SPORT" | "HOMEWORK"
                )
              }
            >
              <option value="COURSE">{zh.taskKind.COURSE}</option>
              <option value="SPORT">{zh.taskKind.SPORT}</option>
              <option value="HOMEWORK">{zh.taskKind.HOMEWORK}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {zh.assign.subject}
            <select
              className="rounded-md border border-[var(--color-border)] px-3 py-2"
              value={subjectTag}
              onChange={(e) => setSubjectTag(e.target.value)}
            >
              {SUBJECT_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
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
            {zh.assign.points}
            <input
              type="number"
              min={0}
              max={9999}
              className="rounded-md border border-[var(--color-border)] px-3 py-2"
              value={pointsReward}
              onChange={(e) => setPointsReward(Number(e.target.value))}
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
              {children.map((m) => (
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
