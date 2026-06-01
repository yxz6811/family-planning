import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少 8 位"),
  displayName: z.string().min(1, "显示名称不能为空").max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createTaskSchema = z.object({
  kind: z.enum(["COURSE", "SPORT", "HOMEWORK"]),
  content: z.string().min(1, "任务内容不能为空").max(2000),
  durationMinutes: z.number().int().min(1).max(480),
  assigneeId: z.string().min(1),
});

export const inviteSchema = z.object({
  inviteeEmail: z.string().email(),
});

export const invitationActionSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});
