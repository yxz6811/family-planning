import { z } from "zod";

const moodEnum = z.enum(["HAPPY", "NEUTRAL", "TIRED", "DIFFICULT"]);

export const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少 8 位"),
  displayName: z.string().min(1, "显示名称不能为空").max(50),
  role: z.enum(["parent", "child"], { required_error: "请选择身份" }),
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
  subjectTag: z.string().min(1).max(20).optional(),
  pointsReward: z.number().int().min(0).max(9999).optional(),
});

export const submitHomeworkSchema = z.object({
  mood: moodEnum,
  submitNote: z.string().max(500).optional(),
});

export const rejectHomeworkSchema = z.object({
  rejectionNote: z.string().max(500).optional(),
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
