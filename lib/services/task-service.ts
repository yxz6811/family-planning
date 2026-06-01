import { TaskKind, TaskStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { taskKindLabel, zh } from "@/lib/messages/zh";

/**
 * 序列化任务供 API/前端使用
 */
export function serializeTask(
  task: {
    id: string;
    kind: TaskKind;
    content: string;
    durationMinutes: number;
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
  const task = await prisma.task.create({
    data: {
      kind: input.kind as TaskKind,
      content: input.content.trim(),
      durationMinutes: input.durationMinutes,
      assignerId,
      assigneeId: input.assigneeId,
      status: TaskStatus.PENDING,
    },
    include: taskInclude,
  });
  return serializeTask(task);
}

/**
 * 完成课程/运动或布置者完成审批任务
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
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: TaskStatus.DONE, completedAt: new Date() },
    include: taskInclude,
  });
  return serializeTask(updated);
}

/**
 * 作业提交审批：更新 B 侧并创建 A 的审批任务
 */
export async function requestHomeworkApproval(taskId: string, userId: string) {
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
  if (homework.approval) {
    throw new Error(zh.errors.approvalExists);
  }
  const approvalTitle = `审批 ${homework.assignee.displayName} 的作业`;
  const result = await prisma.$transaction(async (tx) => {
    const updatedHomework = await tx.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.SUBMITTED,
        completedAt: new Date(),
      },
      include: taskInclude,
    });
    const approvalTask = await tx.task.create({
      data: {
        kind: TaskKind.APPROVAL,
        content: `${approvalTitle}：${homework.content}`,
        durationMinutes: homework.durationMinutes,
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
