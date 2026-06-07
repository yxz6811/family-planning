"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
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
      <Card>
        <p className="text-[var(--color-muted)]">
          请先邀请孩子加入家庭后再布置任务。
        </p>
      </Card>
    );
  }

  function onKindChange(next: "COURSE" | "SPORT" | "HOMEWORK") {
    setKind(next);
    setPointsReward(defaultPointsForKind(next));
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader title={zh.assign.title} />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={zh.assign.kind}>
            <Select
              value={kind}
              onChange={(e) =>
                onKindChange(e.target.value as "COURSE" | "SPORT" | "HOMEWORK")
              }
            >
              <option value="COURSE">{zh.taskKind.COURSE}</option>
              <option value="SPORT">{zh.taskKind.SPORT}</option>
              <option value="HOMEWORK">{zh.taskKind.HOMEWORK}</option>
            </Select>
          </Field>
          <Field label={zh.assign.subject}>
            <Select
              value={subjectTag}
              onChange={(e) => setSubjectTag(e.target.value)}
            >
              {SUBJECT_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={zh.assign.content}>
            <Textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={zh.assign.duration}>
              <Input
                type="number"
                min={1}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
              />
            </Field>
            <Field label={zh.assign.points}>
              <Input
                type="number"
                min={0}
                max={9999}
                value={pointsReward}
                onChange={(e) => setPointsReward(Number(e.target.value))}
                required
              />
            </Field>
          </div>
          <Field label={zh.assign.assignee}>
            <Select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {children.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </Select>
          </Field>
          {error && (
            <p className="rounded-[var(--radius-sm)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-[var(--radius-sm)] bg-[var(--color-success-soft)] px-3 py-2 text-sm text-[var(--color-success)]">
              {success}
            </p>
          )}
          <Button type="submit" className="inline-flex gap-2 self-start">
            <Send className="h-4 w-4" aria-hidden />
            {zh.assign.submit}
          </Button>
        </form>
      </Card>

      {assignedTasks.length > 0 && (
        <section>
          <h3 className="font-heading mb-3 font-semibold">我分发的任务</h3>
          <ul className="flex flex-col gap-2">
            {assignedTasks.map((t) => (
              <li key={t.id}>
                <Card className="p-4">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge>{t.kindLabel}</Badge>
                    <span className="text-sm text-[var(--color-muted)]">
                      → {t.assigneeName}
                    </span>
                    <Badge variant={t.status === "PENDING" ? "muted" : "success"}>
                      {t.status === "PENDING"
                        ? "未完成"
                        : t.status === "SUBMITTED"
                          ? "已提交审批"
                          : "已完成"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">{t.content}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
