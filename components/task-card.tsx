"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOOD_OPTIONS } from "@/lib/constants/product";
import { withBasePath } from "@/lib/base-path";
import { zh } from "@/lib/messages/zh";
import { FocusTimer } from "@/components/focus-timer";

export interface TaskItem {
  id: string;
  kind: string;
  kindLabel: string;
  content: string;
  durationMinutes: number;
  subjectTag?: string | null;
  pointsReward?: number;
  moodLabel?: string | null;
  rejectionNote?: string | null;
  status: string;
  assignerName: string;
  assigneeName: string;
}

interface TaskCardProps {
  task: TaskItem;
  zone: "pending" | "done";
}

/**
 * 任务卡片：打卡、验收、专注钟
 */
export function TaskCard({ task, zone }: TaskCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMood, setShowMood] = useState(false);
  const [mood, setMood] = useState<string>("NEUTRAL");
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);

  async function handleComplete() {
    setLoading(true);
    await fetch(withBasePath(`/api/tasks/${task.id}/complete`), {
      method: "PATCH",
    });
    setLoading(false);
    router.refresh();
  }

  async function handleSubmitHomework() {
    setLoading(true);
    const res = await fetch(
      withBasePath(`/api/tasks/${task.id}/request-approval`),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      }
    );
    setLoading(false);
    if (res.ok) {
      setShowMood(false);
      router.refresh();
    }
  }

  async function handleReject() {
    setLoading(true);
    await fetch(withBasePath(`/api/tasks/${task.id}/reject`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionNote: rejectNote }),
    });
    setLoading(false);
    setShowReject(false);
    router.refresh();
  }

  const showComplete =
    zone === "pending" &&
    task.status === "PENDING" &&
    (task.kind === "COURSE" || task.kind === "SPORT");

  const showApproval =
    zone === "pending" &&
    task.status === "PENDING" &&
    task.kind === "HOMEWORK";

  const showParentApproval =
    zone === "pending" &&
    task.status === "PENDING" &&
    task.kind === "APPROVAL";

  const showFocus =
    zone === "pending" &&
    task.status === "PENDING" &&
    task.kind !== "APPROVAL";

  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--color-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
          {task.kindLabel}
        </span>
        {task.subjectTag && (
          <span className="rounded-full bg-[#E8F0E6] px-2.5 py-0.5 text-xs text-[var(--color-success)]">
            {task.subjectTag}
          </span>
        )}
        <span className="ml-auto text-xs text-[var(--color-muted)]">
          {task.durationMinutes} {zh.taskBoard.minutes}
        </span>
      </div>
      <p className="mb-2 text-base leading-relaxed text-[var(--color-text)]">
        {task.content}
      </p>
      <p className="mb-2 text-xs text-[var(--color-muted)]">
        {zh.taskBoard.from} {task.assignerName}
        {task.pointsReward ? (
          <span className="ml-2 text-[var(--color-primary)]">
            · {zh.taskBoard.pointsReward} {task.pointsReward} {zh.nav.points}
          </span>
        ) : null}
        {task.status === "SUBMITTED" && (
          <span className="ml-2 text-[var(--color-success)]">
            · {zh.taskBoard.submittedLabel}
          </span>
        )}
        {task.moodLabel && (
          <span className="ml-2">· 心情：{task.moodLabel}</span>
        )}
        {task.rejectionNote && zone === "pending" && (
          <span className="ml-2 text-red-600">
            · {zh.taskBoard.rejectedLabel}：{task.rejectionNote}
          </span>
        )}
      </p>

      {showFocus && <FocusTimer durationMinutes={task.durationMinutes} />}

      <div className="mt-3 flex flex-wrap gap-2">
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
        {showApproval && !showMood && (
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowMood(true)}
            className="rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-sm text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          >
            {zh.taskBoard.requestApproval}
          </button>
        )}
        {showParentApproval && !showReject && (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={handleComplete}
              className="rounded-md bg-[var(--color-success)] px-4 py-1.5 text-sm text-white disabled:opacity-60"
            >
              {zh.taskBoard.approvePass}
              {task.pointsReward ? ` (+${task.pointsReward})` : ""}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowReject(true)}
              className="rounded-md border border-red-300 px-4 py-1.5 text-sm text-red-700 disabled:opacity-60"
            >
              {zh.taskBoard.approveReject}
            </button>
          </>
        )}
      </div>

      {showMood && (
        <div className="mt-3 rounded-md border border-[var(--color-border)] p-3">
          <p className="mb-2 text-sm font-medium">{zh.mood.title}</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMood(opt.value)}
                className={
                  mood === opt.value
                    ? "rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs text-white"
                    : "rounded-full border border-[var(--color-border)] px-3 py-1 text-xs"
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmitHomework}
              className="rounded-md bg-[var(--color-primary)] px-3 py-1 text-sm text-white"
            >
              确认提交
            </button>
            <button
              type="button"
              onClick={() => setShowMood(false)}
              className="text-sm text-[var(--color-muted)]"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showReject && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3">
          <input
            className="mb-2 w-full rounded-md border border-[var(--color-border)] px-2 py-1 text-sm"
            placeholder={zh.approval.rejectPlaceholder}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleReject}
              className="rounded-md bg-red-600 px-3 py-1 text-sm text-white"
            >
              确认打回
            </button>
            <button
              type="button"
              onClick={() => setShowReject(false)}
              className="text-sm text-[var(--color-muted)]"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
