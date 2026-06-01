# 家庭规划（Family Planning）

面向家庭的规划与管理应用（开发中）。本仓库使用 [Spec Kit](https://github.com/github/spec-kit) 进行规格驱动开发。

## 项目宪章要点

完整宪章见 [`.specify/memory/constitution.md`](.specify/memory/constitution.md)（v1.0.0）。

| 原则 | 说明 |
|------|------|
| **UI** | 禁止使用蓝紫渐变色作为主视觉风格 |
| **语言** | 项目文档与 UI 以简体中文为主；技术术语、代码标识符及如 vibecoding 等约定词汇除外 |
| **Git** | 每完成一个功能须提交；会话任务全部完成后推送到本仓库并更新本 README |

## 仓库结构

```text
.specify/          # Spec Kit 配置、模板与宪章
.cursor/skills/    # Cursor 技能（speckit-*）
specs/             # 功能规格目录（按功能分支创建）
```

## 开发流程（Spec Kit）

1. `/speckit-specify` — 编写功能规格（中文）
2. `/speckit-plan` — 实现计划与宪章合规检查
3. `/speckit-tasks` — 任务分解
4. `/speckit-implement` — 实现并按功能提交

## 远程仓库

- **GitHub**: https://github.com/yxz6811/family-planning

```bash
git remote add origin https://github.com/yxz6811/family-planning.git  # 若尚未配置
git push -u origin main
```

## 当前功能

| 编号 | 分支 | 规格 | 说明 |
|------|------|------|------|
| 001 | `001-family-collab-mvp` | [规格](specs/001-family-collab-mvp/spec.md) · [计划](specs/001-family-collab-mvp/plan.md) | 家庭协作 MVP：登录、团队、双区任务栏、任务分发（作业/课程/运动） |

需求来源：[RESEARCH.md](RESEARCH.md)

## 状态

- [x] 项目宪章 v1.0.0 已确立（2026-06-01）
- [x] MVP 功能规格 `001-family-collab-mvp`（2026-06-01）
- [x] 实现计划与技术设计（2026-06-01）：Next.js + Prisma/SQLite，见 [plan.md](specs/001-family-collab-mvp/plan.md)
- [ ] 任务分解（待 `/speckit-tasks`）
- [ ] 代码实现（待 `/speckit-implement`）

**技术栈（MVP）**: Next.js 15 · TypeScript · Prisma · SQLite · Tailwind（暖色主题，无蓝紫渐变）
