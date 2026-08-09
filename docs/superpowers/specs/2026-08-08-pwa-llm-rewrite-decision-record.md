# Agent Ask PWA 改造设计方案（设计决策记录）

> **用途**：这是一条重要的设计决策记录，供 claude-mem memory 系统检索和 clear 后的会话恢复使用。
>
> **可检索关键词**：PWA改造、agent_ask pwa、供应商配置、设计文档、PWA LLM rewrite、DeepSeek OpenAI Qwen、SSE 流式、localStorage API Key

- 日期：2026-08-08
- 状态：已确认，待执行（用户计划 clear 后用 subagent-driven-development 技能执行）
- 设计文档：`docs/superpowers/specs/2026-08-08-pwa-llm-rewrite-design.md`（已 commit，commit hash: a2f8f9a）
- 项目路径：`/Users/hl/Projects/Agent/agent_ask/frontend/`

## 背景

将 agent_ask 项目从「React 前端 + Python Socket.IO 后端代理」改造为「纯前端 PWA，用户自带 API Key 直连 LLM」。设计文档已写好并提交，已通过用户审阅确认。

## 用户关键决策（已确认）

1. **供应商**：DeepSeek、OpenAI、OpenAI 兼容（自定义 base_url）、通义千问 (Qwen) — 4 家全选
2. **搜索功能**：去掉（Serper 有 CORS 问题，中文关键词提取无效）
3. **交付形式**：先做 PWA 网页版（Tauri 桌面 App 作为后续目标）
4. **API Key 存储**：明文 localStorage（最简单方案）

## 核心架构变化

- 删除 `services/socket.ts`、`services/api.ts`
- 删除后端 Python 代码（server.py、search.py、config.py、run.py 废弃，保留 git 历史）
- 新增 `services/llm.ts`（fetch SSE 流式，async generator）
- 新增 `services/providers.ts`（4 家供应商预设配置）
- 新增 `services/promptTemplate.ts`（prompt 模板迁移自 server.py:149-197）
- 新增 `store/settingsStore.ts`（zustand + localStorage 持久化）
- 新增 `components/settings/SettingsModal.tsx`（设置弹窗）
- 改造 `chatStore.ts`：5 个 socket.on() → 1 个 async streamChat() 调用
- 附带修复 bug：当前 streaming=False 导致 stream_chunk 监听器是死代码，改造后用真 SSE

## 供应商配置

| 供应商 | baseUrl | 默认模型 |
|--------|---------|---------|
| DeepSeek | https://api.deepseek.com | deepseek-chat |
| OpenAI | https://api.openai.com | gpt-4o-mini |
| Qwen | https://dashscope.aliyuncs.com/compatible-mode | qwen-plus |
| 自定义 | 用户填写 | 用户填写 |

URL 拼接规则：`{baseUrl}/v1/chat/completions`，4 家统一 OpenAI 格式。

## 当前状态

- 设计文档：`docs/superpowers/specs/2026-08-08-pwa-llm-rewrite-design.md` 已写好并 commit（a2f8f9a）
- 已通过 brainstorming 全部 6 节确认
- 已通过 spec 自审（无占位符、无矛盾、范围明确）
- 已通过用户审阅确认
- **下一步**：用户计划 clear 上下文后，用 subagent-driven-development 技能来执行实现计划

## 执行方式（clear 后的恢复指引）

用户计划 clear 后用 subagent-driven 执行。clear 后用户会提示继续，需要：

1. **读取设计文档** `docs/superpowers/specs/2026-08-08-pwa-llm-rewrite-design.md`
2. **调用 writing-plans 技能**生成实现计划
3. **然后用 subagent-driven-development 技能**执行

## 相关文件

- 设计文档（完整）：`/Users/hl/Projects/Agent/agent_ask/docs/superpowers/specs/2026-08-08-pwa-llm-rewrite-design.md`
- 前端代码目录：`/Users/hl/Projects/Agent/agent_ask/frontend/src/`
- 后端废弃代码：`/Users/hl/Projects/Agent/agent_ask/server.py`（prompt 模板在第 149-197 行，需迁移）
