# 家庭规划（Family Planning）

面向 K12 家庭的 **任务协同 · 正向激励 · 客观记录** Web 应用。产品需求对齐 [docs/PRODUCT-PRD.md](docs/PRODUCT-PRD.md)（来源 PRD「智学伴家」，本项目名称不变）。

## 功能概览（一期 MVP）

| 模块 | 能力 |
|------|------|
| 家庭与角色 | 注册时选择家长/孩子；创建家庭者为超级管理员 |
| 任务看板 | 待完成 / 已完成双区；学科标签；积分奖励 |
| 布置任务 | 家长向孩子布置作业/课程/运动，设置预计时长与积分 |
| 提交验收 | 孩子提交时记录心情；家长「通过发积分」或「打回重做」 |
| 专注计时 | 任务卡片内置番茄钟（按预计时长） |

### 演进路线

- **二期**：AI 截图导入作业、静默批改、每日总结
- **三期**：AI 小导师、错题本、家庭周会、IoT 联动

详见 [docs/PRODUCT-PRD.md](docs/PRODUCT-PRD.md)

## 快速开始

```bash
cd my-project
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

浏览器打开 http://localhost:3000

### 演示账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| parent@demo.local | demo1234 | 家长（超级管理员） |
| child@demo.local | demo1234 | 孩子 |

## 线上环境

- **地址**: https://yangxizhe.com/family-planning/login
- **部署**: `/var/www/family-planning`，PM2 端口 `3042`

### 一键上线

在项目根目录执行（需本机可 SSH 到服务器）：

```bash
npm run deploy
```

可选：

```bash
npm run deploy:seed          # 上线并刷新演示账号
npm run deploy -- --check    # 仅本地 build，不同步
```

服务器 SSH / 路径等默认值见 `scripts/deploy.config.example`；复制为 `scripts/deploy.config` 可覆盖。
脚本不会覆盖服务器上的 `.env` 与 `prisma/prod.db`。

## 宪章要点

见 [`.specify/memory/constitution.md`](.specify/memory/constitution.md)：暖色 UI（无蓝紫渐变）、全中文、按功能提交。

## 规格文档

| 文档 | 说明 |
|------|------|
| [RESEARCH.md](RESEARCH.md) | 需求来源 |
| [docs/PRODUCT-PRD.md](docs/PRODUCT-PRD.md) | PRD 对齐与 Roadmap |
| [specs/001-family-collab-mvp/spec.md](specs/001-family-collab-mvp/spec.md) | 功能规格 |

## 技术栈

Next.js 15 · TypeScript · Prisma · SQLite · iron-session · Tailwind CSS 4

## 远程仓库

https://github.com/yxz6811/family-planning
