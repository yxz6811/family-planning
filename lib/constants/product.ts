/**
 * 学科标签（PRD 5.1 任务分类）
 */
export const SUBJECT_TAGS = [
  "语文",
  "数学",
  "英语",
  "物理",
  "化学",
  "生物",
  "历史",
  "地理",
  "运动",
  "其他",
] as const;

/**
 * 心情选项（PRD 5.2 情绪感知）
 */
export const MOOD_OPTIONS = [
  { value: "HAPPY", label: "开心" },
  { value: "NEUTRAL", label: "一般" },
  { value: "TIRED", label: "疲惫" },
  { value: "DIFFICULT", label: "困难" },
] as const;

export type MoodValue = (typeof MOOD_OPTIONS)[number]["value"];

/**
 * 默认任务积分
 * @param kind - 任务类型
 */
export function defaultPointsForKind(kind: string): number {
  if (kind === "HOMEWORK") return 10;
  if (kind === "SPORT") return 5;
  return 5;
}

/**
 * 是否为家长侧角色（可分发与验收）
 */
export function isParentRole(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}
