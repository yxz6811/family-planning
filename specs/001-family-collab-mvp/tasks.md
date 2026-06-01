# 任务清单：家庭协作 MVP

**输入**: [plan.md](./plan.md)、[spec.md](./spec.md)、[data-model.md](./data-model.md)  
**分支**: `001-family-collab-mvp`

## 依赖关系

```text
Phase 1 Setup → Phase 2 Foundational → US1 → US2 → US3 → US4 → US5 → Polish
```

## Phase 1: 项目初始化

**目的**: Next.js 单体、Prisma、Tailwind 暖色主题

- [x] T001 创建 package.json、tsconfig.json、next.config.ts、postcss.config.mjs in project root
- [x] T002 [P] 配置 Tailwind 与 app/globals.css 暖色 CSS 变量 in app/globals.css、tailwind.config.ts
- [x] T003 [P] 添加 .gitignore、.env.example in project root
- [x] T004 定义 Prisma schema（User/Team/TeamInvitation/Task）in prisma/schema.prisma
- [x] T005 运行 prisma migrate 并创建 lib/db.ts Prisma 单例 in lib/db.ts

---

## Phase 2: 基础设施（阻塞所有用户故事）

**目的**: 会话、中文文案、鉴权中间件

- [x] T006 实现 lib/messages/zh.ts 中文 UI/API 文案常量 in lib/messages/zh.ts
- [x] T007 实现密码哈希与 lib/auth/password.ts in lib/auth/password.ts
- [x] T008 实现 iron-session lib/auth/session.ts 与 getSession/requireUser in lib/auth/session.ts
- [x] T009 实现 app/layout.tsx 根布局与全局样式 in app/layout.tsx
- [x] T010 实现 lib/validators.ts Zod 校验 schema in lib/validators.ts

**检查点**: 数据库与会话可用

---

## Phase 3: 用户故事 1 — 注册与登录 (P1)

**目标**: 邮箱注册登录、数据隔离、受保护路由  
**独立测试**: 注册 → 登录 → 见空任务栏 → 退出后无法访问 /

- [x] T011 [US1] 实现 POST /api/auth/register in app/api/auth/register/route.ts
- [x] T012 [US1] 实现 POST /api/auth/login、logout、GET /api/auth/me in app/api/auth/login/route.ts 等
- [x] T013 [US1] 实现 app/(auth)/register/page.tsx 注册页 in app/(auth)/register/page.tsx
- [x] T014 [US1] 实现 app/(auth)/login/page.tsx 登录页 in app/(auth)/login/page.tsx
- [x] T015 [US1] 实现 app/(app)/layout.tsx 鉴权重定向 in app/(app)/layout.tsx
- [x] T016 [US1] 实现 app/(app)/page.tsx 空任务栏壳（上下分区）in app/(app)/tasks/page.tsx
- [x] T017 [US1] 实现 components/nav-bar.tsx 导航与退出 in components/nav-bar.tsx

**检查点**: US1 可独立验收

---

## Phase 4: 用户故事 2 — 加入团队 (P2)

**目标**: 创建团队、邀请、接受/拒绝  
**独立测试**: A 创建团队邀请 B → B 接受 → 成员列表可见

- [x] T018 [US2] 实现 lib/services/team-service.ts in lib/services/team-service.ts
- [x] T019 [US2] 实现 GET/POST /api/team in app/api/team/route.ts
- [x] T020 [US2] 实现 GET/POST /api/team/invitations in app/api/team/invitations/route.ts
- [x] T021 [US2] 实现 PATCH /api/team/invitations/[id] in app/api/team/invitations/[id]/route.ts
- [x] T022 [US2] 实现 app/(app)/team/page.tsx 团队与邀请 UI in app/(app)/team/page.tsx
- [x] T023 [US2] 实现 components/team-panel.tsx in components/team-panel.tsx

**检查点**: US2 可独立验收

---

## Phase 5: 用户故事 3 — 双区任务栏 (P3)

**目标**: 未完成在上、已完成在下、中文空状态  
**独立测试**: 任务在未完成/已完成区间正确展示与移动

- [x] T024 [US3] 实现 lib/services/task-service.ts 列表查询 in lib/services/task-service.ts
- [x] T025 [US3] 实现 GET /api/tasks 分区返回 in app/api/tasks/route.ts
- [x] T026 [US3] 实现 components/task-board.tsx、task-card.tsx in components/task-board.tsx
- [x] T027 [US3] 将 app/(app)/page.tsx 接入真实任务数据 in app/(app)/tasks/page.tsx

**检查点**: US3 可独立验收

---

## Phase 6: 用户故事 4 — 课程与运动分发 (P4)

**目标**: A 向 B 分发课程/运动，B 打勾完成  
**独立测试**: 分发课程 → B 见未完成 → 打勾 → 移至已完成

- [x] T028 [US4] 扩展 task-service.create 与 complete in lib/services/task-service.ts
- [x] T029 [US4] 实现 POST /api/tasks in app/api/tasks/route.ts
- [x] T030 [US4] 实现 PATCH /api/tasks/[id]/complete in app/api/tasks/[id]/complete/route.ts
- [x] T031 [US4] 实现 app/(app)/assign/page.tsx in app/(app)/assign/page.tsx
- [x] T032 [US4] 实现 components/assign-task-form.tsx in components/assign-task-form.tsx

**检查点**: US4 可独立验收

---

## Phase 7: 用户故事 5 — 作业审批 (P5)

**目标**: B 点审批 → A 出现审批任务 → A 打勾  
**独立测试**: 作业审批闭环、防重复审批

- [x] T033 [US5] 实现 requestApproval 与 APPROVAL 任务创建 in lib/services/task-service.ts
- [x] T034 [US5] 实现 PATCH /api/tasks/[id]/request-approval in app/api/tasks/[id]/request-approval/route.ts
- [x] T035 [US5] 在 task-card.tsx 区分作业「审批」与课程/运动「完成」按钮 in components/task-card.tsx
- [x] T036 [US5] 布置者查看已分发任务状态（只读列表）in app/(app)/assign/page.tsx

**检查点**: US5 可独立验收

---

## Phase 8: 收尾

- [x] T037 [P] 实现 prisma/seed.ts 演示账号 in prisma/seed.ts
- [x] T038 更新 README.md 启动说明与功能状态 in README.md
- [x] T039 按 quickstart.md 手动验收路径自检 in specs/001-family-collab-mvp/quickstart.md

---

## 并行示例

```bash
# Phase 1 可并行
T002 + T003

# US4 表单与 API 不同文件
T029 + T031
```

## 实施策略

1. 完成 Phase 1–2 后按 US1→US5 顺序提交（宪章 III）
2. 每完成一个用户故事执行一次 git commit
3. 全部完成后 push 并更新 README
