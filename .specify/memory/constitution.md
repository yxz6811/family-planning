<!--
Sync Impact Report
- Version change: (template/placeholder) → 1.0.0
- Modified principles: 全部占位符 → 三项正式原则（UI 禁令、中文优先、Git 工作流）
- Added sections: UI 与本地化约束、开发工作流与发布
- Removed sections: 模板示例原则 IV/V（集成测试、可观测性等占位）
- Templates: plan-template.md ✅ | spec-template.md ✅ | tasks-template.md ✅ | README.md ✅ | git-config.yml ✅
- Follow-up TODOs: 无
-->

# 家庭规划（Family Planning）项目宪章

## 核心原则

### I. 禁止蓝紫渐变 UI（不可协商）

所有用户界面 MUST 避免「蓝紫渐变色」风格，包括但不限于：

- CSS/Tailwind 等中的 `linear-gradient`、`radial-gradient` 等，起止色或中间色落在典型蓝紫区间（例如 `#4f46e5`–`#a855f7`、`from-blue-*` + `to-purple-*`、`from-indigo-*` + `to-violet-*` 等组合）
- 以蓝紫渐变作为主背景、主按钮、主横幅或品牌 hero 区域的视觉语言
- 依赖此类渐变营造「科技感/AI 感」的默认主题

允许使用：纯色、中性色、暖色/绿色系等非蓝紫渐变配色；若需渐变，MUST 选用非蓝紫色相组合，并在设计说明中注明色值。

**理由**：避免同质化「AI 产品」视觉，保持家庭规划产品温暖、可信赖的独立品牌气质。

### II. 中文优先（不可协商）

项目内所有面向人类阅读的内容 MUST 使用简体中文，包括：

- UI 文案、错误提示、空状态、表单标签与帮助文本
- README、规格说明（spec）、计划（plan）、任务（tasks）、检查清单与注释性文档
- Git 提交说明与 PR 描述（在团队流程允许时）

**例外**：行业固定英文术语、技术专有名词、代码标识符、API/协议字段名，以及用户明确保留的词汇（如 vibecoding）可保持原文，但 MUST 在首次出现或 README 术语表中给出中文释义（若面向最终用户）。

**理由**：产品面向中文家庭用户，统一语言降低认知负担并保证规格与实现一致。

### III. Git 提交与远程发布（不可协商）

开发工作流 MUST 遵守：

1. **按功能提交**：每完成一个可独立验收的功能（对应 spec 中的一个用户故事或 `/speckit-implement` 任务组），MUST 立即创建一次语义清晰的 Git 提交，不得将多个无关功能积压为单次提交。
2. **任务结束后推送**：当代理或开发者完成当前会话中的全部约定任务后，MUST 将分支推送至远程仓库 `https://github.com/yxz6811/family-planning`（`origin` 指向该仓库）。
3. **README 同步**：每次功能交付或宪章/工作流变更后，MUST 更新项目根目录 `README.md`，反映当前能力、启动方式与宪章要点。

**理由**：小步提交便于审查与回滚；远程同步与 README 保证仓库对外可理解、可复现。

## UI 与本地化约束

- 新功能规格（spec）MUST 在「需求」或「假设」中声明 UI 配色策略符合原则 I。
- 所有新增/修改的用户可见字符串 MUST 通过原则 II 审查；代码内注释鼓励中文，技术实现细节可用英文。
- 设计稿或组件库主题变更 MUST 在 PR/提交说明中显式确认「无蓝紫渐变主视觉」。

## 开发工作流与发布

| 阶段 | 要求 |
|------|------|
| 规格 `/speckit-specify` | 中文撰写；UI 需求符合原则 I |
| 实现 `/speckit-implement` | 每完成一个用户故事或任务检查点后提交 |
| 会话结束 | `git push` 至 `origin`；更新 `README.md` |
| 合规审查 | plan 中的 Constitution Check 全部通过后方可进入实现 |

扩展钩子（`.specify/extensions.yml`）中的 `speckit.git.commit` 在启用时作为辅助，**不替代**原则 III 的手动提交义务。

## 治理

- 本宪章优先于其他实践说明；冲突时以本文件为准。
- 修订须：更新 `.specify/memory/constitution.md`、递增版本号（语义化版本）、同步模板与 `README.md`，并单独提交说明修订原因。
- 所有 PR 与 `/speckit-analyze` 审查 MUST 验证是否符合三项核心原则；违规 MUST 在合并前修复或记录经批准的例外（含理由与替代方案）。

**Version**: 1.0.0 | **Ratified**: 2026-06-01 | **Last Amended**: 2026-06-01
