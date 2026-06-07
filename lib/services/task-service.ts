import { TaskKind, TaskStatus, UserRole, type Mood } from "@prisma/client";
import { prisma } from "@/lib/db";
import { defaultPointsForKind, type MoodValue } from "@/lib/constants/product";
import { moodLabel, taskKindLabel, zh } from "@/lib/messages/zh";

/**
 * 序列化任务供 API/前端使用
 */
export function serializeTask(
  task: {
    id: string;
    kind: TaskKind;
    content: string;
    durationMinutes: number;
    subjectTag: string | null;
    pointsReward: number;
    mood: Mood | null;
    submitNote: string | null;
    rejectionNote: string | null;
    status: TaskStatus;
    sourceTaskId: string | null;
    createdAt: Date;
    completedAt: Date | null;
    assigner: { displayName: string };
    assignee: { displayName: string };
  }
) {
  return {
    id: task.id,
    kind: task.kind,
    kindLabel: taskKindLabel(task.kind),
    content: task.content,
    durationMinutes: task.durationMinutes,
    subjectTag: task.subjectTag,
    pointsReward: task.pointsReward,
    mood: task.mood,
    moodLabel: task.mood ? moodLabel(task.mood) : null,
    submitNote: task.submitNote,
    rejectionNote: task.rejectionNote,
    status: task.status,
    assignerName: task.assigner.displayName,
    assigneeName: task.assignee.displayName,
    sourceTaskId: task.sourceTaskId,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
  };
}

const taskInclude = {
  assigner: { select: { displayName: true } },
  assignee: { select: { displayName: true } },
} as const;

/**
 * 用户任务栏：未完成 / 已完成分区
 */
export async function getTaskBoard(userId: string) {
  const pending = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: TaskStatus.PENDING,
    },
    include: taskInclude,
    orderBy: { createdAt: "desc" },
  });
  const done = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: { in: [TaskStatus.DONE, TaskStatus.SUBMITTED] },
    },
    include: taskInclude,
    orderBy: { completedAt: "desc" },
  });
  return {
    pending: pending.map(serializeTask),
    done: done.map(serializeTask),
  };
}

/**
 * 布置者查看已分发任务（只读）
 */
export async function listAssignedByUser(assignerId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      assignerId,
      kind: { in: [TaskKind.COURSE, TaskKind.SPORT, TaskKind.HOMEWORK] },
    },
    include: taskInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return tasks.map(serializeTask);
}

/**
 * 创建并分发任务
 */
export async function createTask(
  assignerId: string,
  input: {
    kind: "COURSE" | "SPORT" | "HOMEWORK";
    content: string;
    durationMinutes: number;
    assigneeId: string;
    subjectTag?: string;
    pointsReward?: number;
  }
) {
  if (assignerId === input.assigneeId) {
    throw new Error(zh.assign.cannotAssignSelf);
  }
  const [assigner, assignee] = await Promise.all([
    prisma.user.findUnique({ where: { id: assignerId } }),
    prisma.user.findUnique({ where: { id: input.assigneeId } }),
  ]);
  if (!assigner?.teamId || assigner.teamId !== assignee?.teamId) {
    throw new Error(zh.assign.notSameTeam);
  }
  if (
    assigner.role !== UserRole.SUPER_ADMIN &&
    assigner.role !== UserRole.ADMIN
  ) {
    throw new Error(zh.errors.parentOnly);
  }
  const points =
    input.pointsReward ?? defaultPointsForKind(input.kind);
  const task = await prisma.task.create({
    data: {
      kind: input.kind as TaskKind,
      content: input.content.trim(),
      durationMinutes: input.durationMinutes,
      subjectTag: input.subjectTag?.trim() || null,
      pointsReward: points,
      assignerId,
      assigneeId: input.assigneeId,
      status: TaskStatus.PENDING,
    },
    include: taskInclude,
  });
  return serializeTask(task);
}

/**
 * 完成课程/运动任务
 */
export async function completeTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: taskInclude,
  });
  if (!task || task.assigneeId !== userId) {
    throw new Error(zh.errors.forbidden);
  }
  if (task.status !== TaskStatus.PENDING) {
    throw new Error(zh.errors.badRequest);
  }
  if (task.kind === TaskKind.HOMEWORK) {
    throw new Error(zh.errors.wrongTaskKind);
  }
  if (task.kind === TaskKind.APPROVAL) {
    return approveHomework(taskId, userId);
  }
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: TaskStatus.DONE, completedAt: new Date() },
    include: taskInclude,
  });
  return serializeTask(updated);
}

/**
 * 作业提交验收（含心情）
 */
export async function requestHomeworkApproval(
  taskId: string,
  userId: string,
  input: { mood: MoodValue; submitNote?: string }
) {
  const homework = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assigner: true,
      assignee: true,
      approval: true,
    },
  });
  if (
    !homework ||
    homework.assigneeId !== userId ||
    homework.kind !== TaskKind.HOMEWORK
  ) {
    throw new Error(zh.errors.forbidden);
  }
  if (homework.status !== TaskStatus.PENDING) {
    throw new Error(zh.errors.homeworkNotPending);
  }
  if (homework.approval && homework.approval.status === TaskStatus.PENDING) {
    throw new Error(zh.errors.approvalExists);
  }
  const approvalTitle = `验收 ${homework.assignee.displayName} 的${homework.subjectTag ?? "作业"}`;
  const result = await prisma.$transaction(async (tx) => {
    if (homework.approval) {
      await tx.task.delete({ where: { id: homework.approval.id } });
    }
    const updatedHomework = await tx.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.SUBMITTED,
        mood: input.mood as Mood,
        submitNote: input.submitNote?.trim() || null,
        rejectionNote: null,
        completedAt: new Date(),
      },
      include: taskInclude,
    });
    const approvalTask = await tx.task.create({
      data: {
        kind: TaskKind.APPROVAL,
        content: `${approvalTitle}：${homework.content}`,
        durationMinutes: homework.durationMinutes,
        subjectTag: homework.subjectTag,
        pointsReward: homework.pointsReward,
        assignerId: homework.assignerId,
        assigneeId: homework.assignerId,
        status: TaskStatus.PENDING,
        sourceTaskId: homework.id,
      },
      include: taskInclude,
    });
    return { homework: updatedHomework, approvalTask };
  });
  return {
    homework: serializeTask(result.homework),
    approvalTask: serializeTask(result.approvalTask),
  };
}

/**
 * 家长验收通过：发放积分
 */
export async function approveHomework(approvalTaskId: string, userId: string) {
  const approval = await prisma.task.findUnique({
    where: { id: approvalTaskId },
    include: {
      sourceTask: { include: { assignee: true } },
    },
  });
  if (
    !approval ||
    approval.assigneeId !== userId ||
    approval.kind !== TaskKind.APPROVAL ||
    approval.status !== TaskStatus.PENDING ||
    !approval.sourceTask
  ) {
    throw new Error(zh.errors.forbidden);
  }
  const homework = approval.sourceTask;
  const points = homework.pointsReward || 0;
  const result = await prisma.$transaction(async (tx) => {
    const updatedApproval = await tx.task.update({
      where: { id: approvalTaskId },
      data: { status: TaskStatus.DONE, completedAt: new Date() },
      include: taskInclude,
    });
    const updatedHomework = await tx.task.update({
      where: { id: homework.id },
      data: { status: TaskStatus.DONE },
      include: taskInclude,
    });
    if (points > 0) {
      await tx.user.update({
        where: { id: homework.assigneeId },
        data: { points: { increment: points } },
      });
    }
    return { approval: updatedApproval, homework: updatedHomework, pointsAwarded: points };
  });
  return {
    task: serializeTask(result.approval),
    pointsAwarded: result.pointsAwarded,
  };
}

/**
 * 家长打回重做
 */
export async function rejectHomework(
  approvalTaskId: string,
  userId: string,
  rejectionNote?: string
) {
  const approval = await prisma.task.findUnique({
    where: { id: approvalTaskId },
    include: { sourceTask: true },
  });
  if (
    !approval ||
    approval.assigneeId !== userId ||
    approval.kind !== TaskKind.APPROVAL ||
    approval.status !== TaskStatus.PENDING ||
    !approval.sourceTask
  ) {
    throw new Error(zh.errors.forbidden);
  }
  const note = rejectionNote?.trim() || zh.approval.defaultRejectNote;
  const result = await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: approvalTaskId },
      data: { status: TaskStatus.DONE, completedAt: new Date() },
    });
    const homework = await tx.task.update({
      where: { id: approval.sourceTask!.id },
      data: {
        status: TaskStatus.PENDING,
        mood: null,
        submitNote: null,
        completedAt: null,
        rejectionNote: note,
      },
      include: taskInclude,
    });
    return homework;
  });
  return serializeTask(result);
}
