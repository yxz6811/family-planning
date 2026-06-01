# 阶段 0 研究：家庭协作 MVP

**日期**: 2026-06-01  
**规格**: [spec.md](./spec.md)

## 1. 全栈框架选型

**决策**: Next.js 15 App Router + TypeScript 单体仓库

**理由**:
- 规格要求 Web、会话认证、服务端数据隔离，Next.js Route Handlers + Server Actions 可在单仓完成。
- App Router 布局便于 `(auth)` / `(app)` 路由组分离登录态与受保护页。
- 与 Prisma、Tailwind 生态成熟，利于 MVP 快速迭代。

**备选**:
- **Vite + Express 分离**: 需维护两套部署与 CORS，MVP 成本更高。
- **Remix**: 同样可行，团队熟悉度与示例量略逊于 Next。

## 2. 数据库与 ORM

**决策**: SQLite + Prisma

**理由**:
- 单文件数据库零运维，满足家庭规模（SC-006：≤5 人、每人 ≤20 任务）。
- Prisma schema 清晰表达 User/Team/Task 关系与枚举。
- 后续生产换 PostgreSQL 仅改 `datasource` 与连接串。

**备选**:
- **Supabase/Postgres 托管**: MVP 引入外部依赖与密钥管理，非必须。
- **JSON 文件存储**: 难以保证并发与邀请/审批事务一致性。

## 3. 认证与会话

**决策**: 邮箱 + 密码注册；`bcryptjs` 哈希；`iron-session` 加密 Cookie 会话

**理由**:
- 对齐规格假设 FR-002。
- 服务端会话便于 API Route 统一 `getSession()` 鉴权，满足 FR-001 数据隔离。
- 避免 JWT 存 localStorage 的 XSS 风险（MVP 够用）。

**备选**:
- **Auth.js (NextAuth) Credentials**: 可行，配置略重；若实现阶段更熟可替换。
- **OAuth 微信**: 规格范围外。

## 4. 任务与审批模型

**决策**: 单一 `Task` 表 + `kind` 枚举（`COURSE` | `SPORT` | `HOMEWORK` | `APPROVAL`）+ `sourceTaskId` 关联

**理由**:
- 审批待办本质是布置者未完成区的一条特殊任务（FR-012），与接收者任务同表可统一任务栏查询。
- `APPROVAL` 类型任务 `assigneeId = 布置者 A`，`sourceTaskId` 指向 B 的作业任务，防止重复审批（FR-014）用唯一约束 `(sourceTaskId, kind=APPROVAL)`。
- 课程/运动完成：状态 `PENDING → DONE`；作业：`PENDING → SUBMITTED`（已点审批）→ 布置者审批任务 `DONE`。

**备选**:
- **独立 ApprovalTask 表**: 多一次 join，MVP 无必要。

## 5. UI 与样式（宪章 I）

**决策**: Tailwind CSS 4 + CSS 变量设计令牌

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--color-bg` | `#F5F0EB` | 页面背景（米白） |
| `--color-primary` | `#C67B5C` | 主按钮、强调（陶土） |
| `--color-text` | `#2D2A26` | 正文 |
| `--color-muted` | `#8A8279` | 次要文字 |
| `--color-success` | `#5A8F6B` | 完成态（暖绿，非蓝紫） |

**禁止**: `bg-gradient-to-r from-blue-* to-purple-*`、`from-indigo-* to-violet-*` 等。

**理由**: 满足 FR-017 与宪章温暖家庭气质。

## 6. API 风格

**决策**: REST JSON Route Handlers；错误体 `{ error: string }` 中文

**理由**:
- 契约可 OpenAPI 描述（`contracts/api.openapi.yaml`）。
- 前端 `fetch` + Server Components 数据加载简单明了。

## 7. 测试策略

**决策**: Vitest 单元测试覆盖 `lib/services/*`；关键路径选手动 quickstart 验收

**理由**:
- 规格未强制 TDD；服务层测试性价比最高。
- E2E 在 P5 完成后可选补 Playwright。

## 8. 未决项解析

| 原标记 | 决议 |
|--------|------|
| 认证方式 | 邮箱 + 密码 |
| 单团队 | `User.teamId` 可空，接受邀请后写入；创建团队时设置 |
| 时长 | `durationMinutes` INT，校验 1–480 |
| 邀请标识 | 按 **邮箱** 查找被邀请用户 |
