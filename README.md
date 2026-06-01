# 家庭规划（Family Planning）

面向家庭的协作任务管理 Web 应用。使用 [Spec Kit](https://github.com/github/spec-kit) 进行规格驱动开发。

## 功能概览

- 邮箱注册 / 登录，数据按用户隔离
- 创建家庭团队、邀请成员（需对方接受）
- 个人任务栏：上方未完成、下方已完成
- 分发任务：课程、运动（接收者打勾完成）、作业（接收者「审批」→ 布置者审批待办）

## 快速开始

```bash
cd my-project
npm install
cp .env.example .env
# 编辑 SESSION_SECRET（至少 32 字符）
npx prisma migrate dev
npm run db:seed
npm run dev
```

浏览器打开 http://localhost:3000

### 演示账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| parent@demo.local | demo1234 | 爸爸 |
| child@demo.local | demo1234 | 小明 |

## 项目宪章要点

完整宪章见 [`.specify/memory/constitution.md`](.specify/memory/constitution.md)（v1.0.0）。

| 原则 | 说明 |
|------|------|
| **UI** | 禁止使用蓝紫渐变色作为主视觉（暖陶土 + 米白主题） |
| **语言** | 简体中文 UI 与文档 |
| **Git** | 按功能提交；完成后推送远程 |

## 规格与文档

| 编号 | 分支 | 文档 |
|------|------|------|
| 001 | `001-family-collab-mvp` | [规格](specs/001-family-collab-mvp/spec.md) · [计划](specs/001-family-collab-mvp/plan.md) · [任务](specs/001-family-collab-mvp/tasks.md) |

## 技术栈

Next.js 15 · TypeScript · Prisma · SQLite · iron-session · Tailwind CSS 4 · Zod

## 远程仓库

https://github.com/yxz6811/family-planning

## 状态

- [x] 项目宪章 v1.0.0（2026-06-01）
- [x] MVP 规格与实现计划
- [x] MVP 代码实现 P1–P5（2026-06-01）
- [ ] 合并至 `main`（可选 PR）
