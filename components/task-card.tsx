"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Clock, Coins, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { FocusTimer } from "@/components/focus-timer";
import { MOOD_OPTIONS } from "@/lib/constants/product";
import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/cn";
import { zh } from "@/lib/messages/zh";

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
    <Card className={cn("p-4", zone === "done" && "opacity-80")}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge>{task.kindLabel}</Badge>
        {task.subjectTag && <Badge variant="success">{task.subjectTag}</Badge>}
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-[var(--color-muted)]">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {task.durationMinutes} {zh.taskBoard.minutes}
        </span>
      </div>
      <p className="mb-3 text-base leading-relaxed">{task.content}</p>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-muted)]">
        <span className="inline-flex items-center gap-1">
          <User className="h-3.5 w-3.5" aria-hidden />
          {zh.taskBoard.from} {task.assignerName}
        </span>
        {task.pointsReward ? (
          <span className="inline-flex items-center gap-1 text-[var(--color-cta)]">
            <Coins className="h-3.5 w-3.5" aria-hidden />
            {zh.taskBoard.pointsReward} {task.pointsReward} {zh.nav.points}
          </span>
        ) : null}
        {task.status === "SUBMITTED" && (
          <Badge variant="success">{zh.taskBoard.submittedLabel}</Badge>
        )}
        {task.moodLabel && <span>心情：{task.moodLabel}</span>}
        {task.rejectionNote && zone === "pending" && (
          <span className="text-[var(--color-danger)]">
            {zh.taskBoard.rejectedLabel}：{task.rejectionNote}
          </span>
        )}
      </div>

      {showFocus && <FocusTimer durationMinutes={task.durationMinutes} />}

      <div className="mt-3 flex flex-wrap gap-2">
        {showComplete && (
          <Button
            variant="success"
            size="sm"
            disabled={loading}
            onClick={handleComplete}
          >
            {zh.taskBoard.complete}
          </Button>
        )}
        {showApproval && !showMood && (
          <Button
            size="sm"
            disabled={loading}
            onClick={() => setShowMood(true)}
          >
            {zh.taskBoard.requestApproval}
          </Button>
        )}
        {showParentApproval && !showReject && (
          <>
            <Button
              variant="success"
              size="sm"
              disabled={loading}
              onClick={handleComplete}
            >
              {zh.taskBoard.approvePass}
              {task.pointsReward ? ` (+${task.pointsReward})` : ""}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={() => setShowReject(true)}
              className="border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
            >
              {zh.taskBoard.approveReject}
            </Button>
          </>
        )}
      </div>

      {showMood && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="mb-3 text-sm font-medium">{zh.mood.title}</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMood(opt.value)}
                className={cn(
                  "interactive focus-ring rounded-[var(--radius-full)] px-3 py-1.5 text-xs",
                  mood === opt.value
                    ? "bg-[var(--color-primary)] text-white"
                    : "border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-secondary)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" disabled={loading} onClick={handleSubmitHomework}>
              确认提交
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowMood(false)}>
              取消
            </Button>
          </div>
        </div>
      )}

      {showReject && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4">
          <Field label={zh.approval.rejectPlaceholder}>
            <Input
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
          </Field>
          <div className="mt-3 flex gap-2">
            <Button variant="danger" size="sm" disabled={loading} onClick={handleReject}>
              确认打回
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowReject(false)}>
              取消
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
