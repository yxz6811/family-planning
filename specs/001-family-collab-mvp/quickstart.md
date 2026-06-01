# 快速开始：家庭协作 MVP

**分支**: `001-family-collab-mvp`  
**计划**: [plan.md](./plan.md)

## 前置条件

- Node.js 20+
- npm 或 pnpm

## 初始化（实现阶段执行）

```bash
cd my-project
npm install
cp .env.example .env
# 编辑 .env：SESSION_SECRET、DATABASE_URL="file:./dev.db"
npx prisma migrate dev
npx prisma db seed   # 可选：演示账号
npm run dev
```

浏览器打开 http://localhost:3000

## 演示账号（seed 建议）

| 角色 | 邮箱 | 密码 | 显示名 |
|------|------|------|--------|
| 家长 | parent@demo.local | demo1234 | 爸爸 |
| 孩子 | child@demo.local | demo1234 | 小明 |

## 验收路径（对齐 spec）

### P1 注册登录

1. 访问 `/register` 注册新邮箱
2. 登录后进入 `/` 看到空任务栏（上「未完成」/下「已完成」）
3. 退出后无法访问 `/` 受保护页

### P2 团队

1. 家长登录 → `/team` 创建团队
2. 邀请 `child@demo.local`
3. 孩子登录 → 接受邀请 → 成员列表显示双方

### P3 任务栏

1. 确认分区标题为中文、空状态友好

### P4 课程/运动

1. 家长 `/assign` 向孩子分发「课程」，填内容与时长
2. 孩子任务栏上方出现任务，打勾后移至下方
3. 家长可查看孩子完成状态

### P5 作业审批

1. 家长分发「作业」给孩子
2. 孩子完成后点「审批」
3. 家长未完成区出现「审批 小明 的作业」
4. 家长打勾后进入已完成区；孩子不可重复点审批

## 开发命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run test         # Vitest
npx prisma studio    # 数据浏览
```

## Git 检查点（宪章 III）

按用户故事分别提交，建议顺序：

1. `feat: 用户注册与登录 (US1)`
2. `feat: 团队创建与邀请 (US2)`
3. `feat: 双区任务栏 (US3)`
4. `feat: 分发课程与运动任务 (US4)`
5. `feat: 作业审批闭环 (US5)`

会话结束前：

```bash
git push origin 001-family-collab-mvp
```

并更新根目录 `README.md` 中的实现状态。

## 相关文档

- [spec.md](./spec.md) — 功能规格
- [data-model.md](./data-model.md) — 数据模型
- [contracts/api.openapi.yaml](./contracts/api.openapi.yaml) — API 契约
