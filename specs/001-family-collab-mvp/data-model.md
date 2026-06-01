# 数据模型：家庭协作 MVP

**日期**: 2026-06-01  
**ORM**: Prisma  
**数据库**: SQLite（MVP）

## 枚举

### TaskKind（任务类型）

| 值 | 中文 UI | 说明 |
|----|---------|------|
| `COURSE` | 课程 | 接收者直接打勾完成 |
| `SPORT` | 运动 | 接收者直接打勾完成 |
| `HOMEWORK` | 作业 | 接收者点「审批」触发布置者待办 |
| `APPROVAL` | 审批 | 仅出现在布置者栏；标题含接收者名 |

### TaskStatus（任务状态）

| 值 | 说明 |
|----|------|
| `PENDING` | 未完成（出现在上方区域） |
| `SUBMITTED` | 作业已提交审批（B 侧视为已完成区或带标签） |
| `DONE` | 已完成（出现在下方区域） |

### InvitationStatus（邀请状态）

| 值 | 说明 |
|----|------|
| `PENDING` | 待处理 |
| `ACCEPTED` | 已接受 |
| `REJECTED` | 已拒绝 |

## 实体关系图

```text
User ──< TeamMember? >── Team
  │                        │
  │                        └──< TeamInvitation
  │
  ├──< Task (as assignee) assigneeId
  └──< Task (as assigner) assignerId

Task (HOMEWORK) ──sourceTaskId──> Task (APPROVAL)  [0..1 对 1]
```

## 表结构

### User

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (cuid) | PK | |
| email | String | UNIQUE, NOT NULL | 登录标识 |
| passwordHash | String | NOT NULL | bcrypt |
| displayName | String | NOT NULL | 显示名称（审批文案） |
| teamId | String? | FK → Team | 单团队；空表示未加入 |
| createdAt | DateTime | | |

**规则**: FR-018 — 有 `teamId` 时不可创建新团队或接受其他团队邀请（除非先离开，MVP 不支持离开则拒绝）。

### Team

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (cuid) | PK | |
| name | String | NOT NULL | 默认「我的家庭」 |
| ownerId | String | FK → User | 创建者 |
| createdAt | DateTime | | |

### TeamInvitation

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (cuid) | PK | |
| teamId | String | FK | |
| inviterId | String | FK → User | |
| inviteeEmail | String | NOT NULL | 被邀请邮箱 |
| inviteeId | String? | FK → User | 接受后填充 |
| status | InvitationStatus | DEFAULT PENDING | |
| createdAt | DateTime | | |
| respondedAt | DateTime? | | |

**规则**: 同一 `teamId + inviteeEmail` 在 `PENDING` 状态下唯一。

### Task

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | String (cuid) | PK | |
| kind | TaskKind | NOT NULL | |
| content | String | NOT NULL | 任务内容 |
| durationMinutes | Int | 1–480 | FR-019 |
| assignerId | String | FK → User | 布置者 A |
| assigneeId | String | FK → User | 接收者 B（审批任务为 A） |
| status | TaskStatus | DEFAULT PENDING | |
| sourceTaskId | String? | FK → Task | 仅 `APPROVAL` 指向 `HOMEWORK` |
| createdAt | DateTime | | |
| completedAt | DateTime? | | |

**索引**: `(assigneeId, status)`, `(assignerId)`  
**唯一**: `(sourceTaskId)` WHERE `kind = APPROVAL`（FR-014 防重复）

## 状态迁移

### 课程 / 运动（assignee 操作）

```text
PENDING ──[打勾]──> DONE
```

### 作业（assignee 操作）

```text
PENDING ──[审批]──> SUBMITTED
         └── 同事务创建 APPROVAL 任务给 assigner（PENDING）
```

### 审批任务（assigner 操作）

```text
PENDING ──[打勾]──> DONE
```

## 任务栏查询规则（FR-006）

对当前用户 `U`：

- **未完成区**: `assigneeId = U` AND `status IN (PENDING)` OR（`kind = APPROVAL` AND `status = PENDING`）
- **已完成区**: `assigneeId = U` AND `status IN (DONE, SUBMITTED)`  
  - 作业 `SUBMITTED` 显示在下方并标注「已提交审批」

排序：`createdAt DESC`

## 校验规则摘要

| 规则 | 实现位置 |
|------|----------|
| A ≠ B 分发 | `task-service.create` |
| 同团队成员 | 校验 `assigner.teamId === assignee.teamId` |
| 时长 1–480 | Zod schema |
| 邀请已注册用户 | 按 email 查 User，无则 400 中文提示 |
| 重复审批 | 创建 APPROVAL 前查 `sourceTaskId` 是否已有 APPROVAL |
