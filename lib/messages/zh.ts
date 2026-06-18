/**
 * 中文 UI 与 API 错误文案（宪章 II）
 */
export const zh = {
  appName: "家庭规划",
  tagline: "家庭任务协同 · 正向激励 · 客观记录",
  nav: {
    tasks: "今日任务",
    team: "家庭",
    assign: "布置任务",
    login: "登录",
    register: "注册",
    logout: "退出",
    points: "积分",
  },
  auth: {
    email: "邮箱",
    password: "密码",
    displayName: "显示名称",
    role: "我是",
    roleParent: "家长",
    roleChild: "孩子",
    registerTitle: "注册账户",
    loginTitle: "登录",
    registerSubmit: "注册",
    loginSubmit: "登录",
    emailExists: "该邮箱已注册",
    invalidCredentials: "邮箱或密码错误",
    required: "请填写所有必填项",
  },
  role: {
    SUPER_ADMIN: "超级管理员",
    ADMIN: "家长",
    EXECUTOR: "孩子",
  },
  taskBoard: {
    pending: "待完成",
    done: "已完成",
    emptyPending: "今日暂无任务，去休息或联系家长布置吧",
    emptyDone: "还没有完成的任务，加油！",
    complete: "打卡完成",
    requestApproval: "提交验收",
    approvePass: "通过并发放积分",
    approveReject: "打回重做",
    minutes: "分钟",
    from: "来自",
    submittedLabel: "待家长验收",
    rejectedLabel: "已打回，请重做",
    focusStart: "开始专注",
    focusPause: "暂停",
    focusDone: "专注完成",
    pointsReward: "完成可得",
  },
  mood: {
    title: "今日心情",
    HAPPY: "开心",
    NEUTRAL: "一般",
    TIRED: "疲惫",
    DIFFICULT: "困难",
  },
  taskKind: {
    COURSE: "课程",
    SPORT: "运动",
    HOMEWORK: "作业",
    APPROVAL: "待验收",
  },
  team: {
    title: "我的家庭",
    create: "创建家庭",
    teamName: "家庭名称",
    invite: "邀请成员",
    inviteeEmail: "对方邮箱",
    sendInvite: "发送邀请",
    members: "成员",
    pendingInvites: "待处理邀请",
    accept: "接受",
    reject: "拒绝",
    noTeam: "你还没有加入家庭",
    alreadyInTeam: "你已在一个家庭中，无法接受其他邀请",
    alreadyInOtherTeam: "对方已加入其他家庭，无法邀请",
    alreadyMember: "对方已在你的家庭中",
    inviteNotFound: "邀请不存在",
    userNotFound: "未找到该邮箱对应的用户，请对方先注册",
    cannotInviteSelf: "不能邀请自己",
  },
  assign: {
    title: "布置任务",
    kind: "任务类型",
    subject: "学科标签",
    content: "任务内容",
    duration: "预计时长（分钟）",
    points: "完成奖励积分",
    assignee: "交给",
    submit: "布置",
    success: "任务已布置",
    notSameTeam: "只能向同一家庭成员布置任务",
    cannotAssignSelf: "不能向自己布置任务",
    invalidDuration: "时长须在 1 到 480 分钟之间",
    parentOnly: "仅家长可布置任务",
  },
  approval: {
    defaultRejectNote: "请根据家长反馈重新完成",
    rejectPlaceholder: "打回说明（可选）",
    pointsAwarded: "已发放积分",
  },
  errors: {
    unauthorized: "请先登录",
    forbidden: "无权操作",
    notFound: "资源不存在",
    badRequest: "请求无效",
    homeworkNotPending: "该作业当前不可提交验收",
    approvalExists: "已有待验收记录",
    wrongTaskKind: "该操作不适用于此任务类型",
    parentOnly: "仅家长可执行此操作",
  },
} as const;

/**
 * 任务类型中文标签
 */
export function taskKindLabel(kind: string): string {
  const key = kind as keyof typeof zh.taskKind;
  return zh.taskKind[key] ?? kind;
}

/**
 * 心情中文标签
 */
export function moodLabel(mood: string): string {
  const key = mood as keyof typeof zh.mood;
  if (key === "title") return mood;
  return zh.mood[key] ?? mood;
}

/**
 * 角色中文标签
 */
export function roleLabel(role: string): string {
  const key = role as keyof typeof zh.role;
  return zh.role[key] ?? role;
}
