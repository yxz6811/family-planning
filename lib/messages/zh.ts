/**
 * 中文 UI 与 API 错误文案（宪章 II）
 */
export const zh = {
  appName: "家庭规划",
  nav: {
    tasks: "任务栏",
    team: "团队",
    assign: "分发任务",
    login: "登录",
    register: "注册",
    logout: "退出",
  },
  auth: {
    email: "邮箱",
    password: "密码",
    displayName: "显示名称",
    registerTitle: "注册账户",
    loginTitle: "登录",
    registerSubmit: "注册",
    loginSubmit: "登录",
    emailExists: "该邮箱已注册",
    invalidCredentials: "邮箱或密码错误",
    required: "请填写所有必填项",
  },
  taskBoard: {
    pending: "未完成",
    done: "已完成",
    emptyPending: "暂无待办，休息一下吧",
    emptyDone: "还没有已完成的任务",
    complete: "完成",
    requestApproval: "审批",
    minutes: "分钟",
    from: "来自",
    submittedLabel: "已提交审批",
  },
  taskKind: {
    COURSE: "课程",
    SPORT: "运动",
    HOMEWORK: "作业",
    APPROVAL: "审批",
  },
  team: {
    title: "我的团队",
    create: "创建团队",
    teamName: "团队名称",
    invite: "邀请成员",
    inviteeEmail: "对方邮箱",
    sendInvite: "发送邀请",
    members: "成员",
    pendingInvites: "待处理邀请",
    accept: "接受",
    reject: "拒绝",
    noTeam: "你还没有加入团队",
    alreadyInTeam: "你已在一个团队中",
    inviteNotFound: "邀请不存在",
    userNotFound: "未找到该邮箱对应的用户，请对方先注册",
    cannotInviteSelf: "不能邀请自己",
  },
  assign: {
    title: "分发任务",
    kind: "任务类型",
    content: "任务内容",
    duration: "时长（分钟）",
    assignee: "接收者",
    submit: "分发",
    success: "任务已分发",
    notSameTeam: "只能向同团队成员分发任务",
    cannotAssignSelf: "不能向自己分发任务",
    invalidDuration: "时长须在 1 到 480 分钟之间",
  },
  errors: {
    unauthorized: "请先登录",
    forbidden: "无权操作",
    notFound: "资源不存在",
    badRequest: "请求无效",
    homeworkNotPending: "该作业当前不可提交审批",
    approvalExists: "审批任务已存在",
    wrongTaskKind: "该操作不适用于此任务类型",
  },
} as const;

/**
 * 任务类型中文标签
 * @param kind - Prisma TaskKind
 */
export function taskKindLabel(kind: string): string {
  const key = kind as keyof typeof zh.taskKind;
  return zh.taskKind[key] ?? kind;
}
