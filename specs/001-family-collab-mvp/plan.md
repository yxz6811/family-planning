# 实现计划：家庭协作 MVP

**分支**: `001-family-collab-mvp` | **日期**: 2026-06-01 | **规格**: [spec.md](./spec.md)

**输入**: [specs/001-family-collab-mvp/spec.md](./spec.md)

## 摘要

构建响应式 Web 应用，支持家庭团队成员通过邮箱注册登录、单团队邀请协作、上下双区个人任务栏，以及三类任务（作业/课程/运动）的分发与作业审批闭环。技术路线为 **Next.js 全栈单体** + **SQLite/Prisma** + **会话 Cookie 认证**，UI 使用 Tailwind 暖色主题，API 以 Route Handlers 暴露 REST 契约，按用户故事 P1→P5 增量交付。

## 技术上下文

**语言/版本**: TypeScript 5.x、Node.js 20 LTS

**主要依赖**: Next.js 15（App Router）、React 19、Prisma 6、Zod、bcryptjs、iron-session（或等价安全会话）、Tailwind CSS 4

**存储**: SQLite（`prisma/dev.db`，MVP 本地文件；生产可换 PostgreSQL 仅需改 datasource）

**测试**: Vitest + React Testing Library（组件/服务）；可选 Playwright（关键用户路径 E2E）

**目标平台**: 现代浏览器响应式 Web（桌面优先，移动端可读）

**项目类型**: web-application（单体全栈，非前后端分离仓库）

**性能目标**: 任务栏列表 <500ms 首屏（SC-006：5 人 × 20 条任务）；审批任务创建对用户「单次加载可感知」（SC-005）

**约束**: 宪章禁止蓝紫渐变 UI；全中文 UI；每用户单团队；无实时推送（轮询/刷新）

**规模/范围**: MVP 约 8–12 个页面/路由、~15 个 API、5 个用户故事、3 种业务任务 + 1 种审批任务类型

## Constitution Check

*GATE: Phase 0 前通过；Phase 1 设计后复核 — 全部通过*

| 原则 | 检查项 | Phase 1 结论 |
|------|--------|----------------|
| I. 禁止蓝紫渐变 UI | `tailwind.config` / CSS 变量仅暖色纯色；无 `from-blue`/`to-purple` | ✅ `research.md` 设计令牌 |
| II. 中文优先 | UI 文案常量文件 `lib/messages/zh.ts`；API 错误 message 中文 | ✅ 契约示例均为中文 |
| III. Git 与 README | 实现按 US1–US5 分 commit；本阶段更新 README + push | ✅ quickstart 含提交检查点 |

无宪章违规，**Complexity Tracking** 留空。

## 项目结构

### 文档（本功能）

```text
specs/001-family-collab-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.openapi.yaml
└── tasks.md              # /speckit-tasks 产出
```

### 源代码（仓库根 `my-project/`）

```text
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/
│   ├── layout.tsx          # 鉴权布局 + 导航
│   ├── page.tsx            # 任务栏（上未完成/下已完成）
│   ├── team/page.tsx       # 团队与邀请
│   └── assign/page.tsx     # 分发任务
├── api/
│   ├── auth/[...]/route.ts
│   ├── tasks/route.ts
│   ├── tasks/[id]/complete/route.ts
│   ├── tasks/[id]/approve/route.ts
│   └── team/
│       ├── route.ts
│       └── invitations/route.ts
├── globals.css
└── layout.tsx

components/
├── task-board.tsx
├── task-card.tsx
├── team-panel.tsx
└── assign-task-form.tsx

lib/
├── db.ts                   # Prisma 单例
├── auth/session.ts
├── auth/password.ts
├── services/task-service.ts
├── services/team-service.ts
└── messages/zh.ts          # 中文 UI 文案

prisma/
├── schema.prisma
└── seed.ts

tests/
├── unit/
└── integration/

package.json
next.config.ts
tailwind.config.ts
.env.example
```

**结构决策**: 采用 **Option 2 简化单体**（`app/` 同时承载 UI 与 API），避免独立 `frontend/`/`backend/` 目录以降低 MVP 运维成本；业务逻辑集中在 `lib/services/` 便于按用户故事测试。

## 阶段划分与交付顺序

| 阶段 | 用户故事 | 交付物 |
|------|----------|--------|
| 1 | P1 注册登录 | 认证 API、会话中间件、空任务栏壳页 |
| 2 | P2 加入团队 | Team/Invitation 模型与服务、团队页 |
| 3 | P3 双区任务栏 | Task 列表 API、分区 UI、空状态 |
| 4 | P4 课程/运动 | 分发表单、完成打勾 |
| 5 | P5 作业审批 | 审批按钮、自动创建布置者审批任务 |

## Complexity Tracking

> 无宪章例外。
