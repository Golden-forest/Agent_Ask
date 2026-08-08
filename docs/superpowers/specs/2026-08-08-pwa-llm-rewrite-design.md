# Agent Ask PWA 改造设计

> 将 agent_ask 从「React 前端 + Python Socket.IO 后端代理」改造为「纯前端 PWA，用户自带 API Key 直连 LLM」。

- 日期：2026-08-08
- 状态：已确认，待写实现计划
- 关联代码：`frontend/src/`、`server.py`（废弃）

## 1. 背景与动机

### 现状问题

当前架构是「React 前端 + FastAPI 后端代理」：

- 后端（`server.py`）本质是 Socket.IO 代理 + Prompt 模板字符串
- LLM 调用配置了 `streaming=False`，但前端注册了 `stream_chunk` 监听器——**死代码**，名义上流式实为一次性返回
- 对话历史只存内存字典，重启即丢
- REST 接口（`/chat`、`/analyze`）前端从未调用过
- Serper 搜索的中文关键词提取几乎无效（按空格分词）

### 改造目标

把 agent_ask 变成**零后端的 PWA 网页应用**：

- 用户在设置页选供应商 + 填自己的 API Key
- 前端直接 fetch 调用 LLM API，真 SSE 流式逐字输出
- 纯静态部署到 GitHub Pages / Vercel / Cloudflare Pages，零运维成本
- 后续可套 Tauri 壳打包成桌面 App（本次不实施）

## 2. 关键决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 供应商 | DeepSeek、OpenAI、OpenAI 兼容（自定义 base_url）、通义千问 | 4 家均支持 OpenAI `/v1/chat/completions` 格式，一套代码通吃 |
| 搜索功能 | 去掉 | Serper 有 CORS 问题，中文关键词提取无效，价值低 |
| 交付形式 | 先 PWA 网页版 | 本周就能用，可分享链接；Tauri 桌面 App 作为后续目标 |
| API Key 存储 | 明文 localStorage | 个人工具场景，最简方案。后续 Tauri 版可用系统密钥库 |
| 流式方案 | fetch + ReadableStream 解析 SSE | 原生 API，无额外依赖，比 Socket.IO 更轻量 |

## 3. 整体架构

```
┌─────────────────────────────────────────────────────┐
│  PWA (静态部署，无后端)                              │
│                                                     │
│  ┌─────────────┐   ┌──────────────┐                │
│  │ React UI    │   │ Settings 弹窗 │                │
│  │ (现有组件)   │   │ (供应商+Key)  │                │
│  └──────┬──────┘   └──────┬───────┘                │
│         │                 │                         │
│         └────────┬────────┘                        │
│                  ▼                                  │
│  ┌──────────────────────────────┐                  │
│  │  LLM Service                  │                  │
│  │  - 统一 OpenAI 格式 fetch     │                  │
│  │  - SSE 流式解析 (async gen)   │                  │
│  │  - 4 家供应商配置             │                  │
│  └──────────────┬───────────────┘                  │
│                 │                                   │
└─────────────────┼───────────────────────────────────┘
                  │ fetch (HTTPS, 直连)
                  ▼
     ┌─────────────────────────────┐
     │  LLM Provider API           │
     │  - api.deepseek.com         │
     │  - api.openai.com           │
     │  - dashscope.aliyuncs.com   │
     │  - 用户自定义 base_url       │
     └─────────────────────────────┘
```

核心变化：

- 删除 `services/socket.ts`、`services/api.ts`
- 新增 `services/llm.ts`（fetch SSE 流式调用）、`services/providers.ts`（供应商配置）、`services/promptTemplate.ts`（prompt 模板迁移自 `server.py:149-197`）
- `chatStore.ts` 里 5 个 `socket.on()` 改为 1 个 `async streamChat()` 调用
- 新增 `store/settingsStore.ts`（zustand，管理供应商配置）
- 新增 `components/settings/SettingsModal.tsx`
- 后端 Python 代码（`server.py`、`search.py`、`config.py`、`run.py`）全部废弃，保留在 git 历史中

附带修复的 bug：当前后端 `streaming=False` 导致前端 `stream_chunk` 监听器是死代码。改造后使用真 SSE 流式，前端逐字渲染生效。

## 4. 供应商配置

4 家供应商的预设配置（定义在 `services/providers.ts`）：

| 供应商 | baseUrl | 预设模型 | 默认模型 |
|--------|---------|---------|---------|
| DeepSeek | `https://api.deepseek.com` | deepseek-chat, deepseek-reasoner | deepseek-chat |
| OpenAI | `https://api.openai.com` | gpt-4o, gpt-4o-mini, gpt-4.1, o3-mini | gpt-4o-mini |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode` | qwen-plus, qwen-max, qwen-turbo, qwq-32b | qwen-plus |
| 自定义 | 用户填写 | 用户填写 | - |

每个供应商配置包含：

```typescript
interface Provider {
  id: string
  name: string
  baseUrl: string
  apiKeyUrl: string        // 跳转获取 Key 的链接
  models: ModelOption[]
  defaultModel: string
}
```

### 设置页交互流程

```
1. 供应商下拉 (4 选 1)
   ├─ 选 DeepSeek/OpenAI/Qwen
   │   → 自动填充 base_url + 模型列表
   │   → 选模型（下拉）
   │   → 填 API Key（带"获取 Key"链接）
   │
   └─ 选"自定义"
       → 手填 base_url
       → 手填模型 id
       → 填 API Key
```

### URL 拼接规则

所有供应商统一拼接 `{baseUrl}/v1/chat/completions`。Qwen 的 baseUrl 已包含 `/compatible-mode` 路径。自定义模式约定用户填到 `/v1` 层级，代码拼 `/chat/completions`。

### CORS 兼容性

| 供应商 | 浏览器直连 | 说明 |
|--------|-----------|------|
| DeepSeek | 支持 | 已验证 |
| OpenAI | 支持 | 官方支持 |
| Qwen | 支持 | 兼容模式支持 CORS |
| 自定义 | 取决于服务商 | 可能需服务端配 CORS |

## 5. LLM Service 设计

### 核心接口

```typescript
// services/llm.ts
async function* streamChat(
  messages: ApiMessage[],
  settings: LlmSettings,
  signal?: AbortSignal
): AsyncGenerator<string>
```

使用 async generator（而非 callback），`chatStore` 中用 `for await` 消费，代码直观。

### 内部流程

```
streamChat()
  1. 构建 OpenAI 格式请求体
     POST {baseUrl}/v1/chat/completions
     body: { model, messages, stream: true }
     headers: { Authorization: `Bearer ${apiKey}`, Content-Type: application/json }

  2. fetch + ReadableStream 读取 SSE
     response.body.getReader()
     TextDecoder 逐块解码

  3. 按行分割，解析 "data: {...}" 行
     JSON.parse → choices[0].delta.content
     yield content
     遇到 "data: [DONE]" 结束

  4. 错误处理（见第 8 节）
```

### Prompt 模板迁移

`services/promptTemplate.ts` 包含从 `server.py:149-197` 迁移的 prompt 逻辑：

```typescript
export function buildApiMessages(
  message: string,
  history: ChatMessage[]
): ApiMessage[]
```

- Accept 检测逻辑保留（`message.trim().lower() === 'accept'`）
- 澄清问题格式保留（`**Question**` / `**Strategic Options**`）
- 最终结果格式保留（`**Optimized Prompt**`）
- 历史对话作为 messages 数组传入，prompt 模板作为最后一条 user message

### chatStore.ts 改造

旧（Socket.IO）：

```
initSocket() → 注册 5 个 socket.on()
sendMessage() → socket.emit('chat_message')
```

新（fetch SSE）：

```
sendMessage() {
  1. 调 buildApiMessages() 构建 messages
  2. 创建空的 assistant message (isStreaming: true)
  3. const ac = new AbortController()
  4. for await (chunk of streamChat(messages, settings, ac.signal)) {
       追加 chunk 到最后一条 message
       更新 systemStatus
     }
  5. catch → 错误处理
  6. finally → isStreaming: false
}
```

删除的字段/方法：`_socketInitialized`、`initSocket()`、所有 `socketService.on/off/emit` 调用、`isSearching` 状态。

### 中止机制

发送后 Send 按钮变为 Stop 按钮，点击调用 `AbortController.abort()`。已接收的部分内容保留显示，消息标记为未完成。

## 6. UI 变更

### 新增：Settings 弹窗

全屏遮罩弹窗，从 Header 齿轮图标打开。包含：

- 供应商下拉（4 选 1）
- 模型下拉（预设供应商时显示预设列表；自定义时为文本输入）
- API Key 输入（遮罩显示 + 眼睛图标切换）
- "获取 Key" 链接（跳转对应平台）
- 自定义模式额外显示 Base URL 和 Model ID 输入
- Test Connection 按钮
- Save / Cancel 按钮

### 首启动引导

```
App.tsx 挂载时:
  settingsStore 里有没有 apiKey?
    有 → 正常显示聊天界面
    无 → 强制弹出 Settings（不可关闭，背景遮罩）
         提示: "首次使用，请配置 LLM 供应商和 API Key"
```

### 聊天界面无 Key 时

输入框区域显示提示条："未配置 API Key，请先 [前往设置]"，发送按钮禁用。

### 现有组件改动清单

| 文件 | 改动 |
|------|------|
| `Header.tsx` | 加齿轮图标按钮 |
| `App.tsx` | 挂载 SettingsModal + 首启动检测 |
| `ChatInterface.tsx` | 删除 isSearching 相关逻辑 |
| `chatStore.ts` | Socket.IO → streamChat（核心改造） |
| `LoadingIndicator.tsx` | 去掉搜索状态分支 |
| `types/index.ts` | 加 LlmSettings、Provider、ModelOption 类型 |
| `vite.config.ts` | 去掉 proxy，加 vite-plugin-pwa |

### 新增文件

| 文件 | 职责 |
|------|------|
| `components/settings/SettingsModal.tsx` | 设置弹窗 |
| `services/llm.ts` | 统一 fetch SSE 流式调用 |
| `services/providers.ts` | 4 家供应商预设配置 |
| `services/promptTemplate.ts` | prompt 模板（迁移自 server.py） |
| `store/settingsStore.ts` | 供应商配置状态管理 |

### 删除文件

| 文件 | 原因 |
|------|------|
| `services/socket.ts` | 不再需要 Socket.IO |
| `services/api.ts` | 从未被调用过 |

## 7. 数据存储

### settingsStore（zustand + localStorage 持久化）

```typescript
interface LlmSettings {
  provider: 'deepseek' | 'openai' | 'qwen' | 'custom'
  apiKey: string
  model: string
  customBaseUrl: string   // 仅 custom 模式
  customModel: string     // 仅 custom 模式
}
```

localStorage key: `agent_ask_settings`，值为 JSON。

### 读取容错

```
读取 settings:
  JSON 解析成功 → 正常使用
  JSON 解析失败 → 清除并返回默认值 + toast "配置已重置"
  字段缺失 → 用默认值填充
```

## 8. 错误处理

### 错误分类

```
用户发送消息
  │
  ├─ 前置检查
  │   未配置 API Key → 禁用发送 + 提示"前往设置"
  │   网络离线 → toast "网络不可用"
  │
  ├─ 请求阶段 (fetch)
  │   HTTP 401 → toast "API Key 无效" + 自动弹出 Settings
  │   HTTP 403 → toast "Key 无权限访问该模型"
  │   HTTP 429 → toast "请求过于频繁，请稍后重试"
  │   HTTP 5xx → toast "服务暂时不可用"
  │   网络错误 → toast "无法连接服务器"
  │
  ├─ 流式阶段 (SSE 读取中)
  │   连接中断 → 保留已接收内容 + 标记未完成 + 显示重试按钮
  │   解析错误 → 跳过错误行，继续读取
  │
  └─ 完成后
      空响应 → 替换为"未收到有效回复，请重试"
```

### Test Connection 反馈

| 结果 | 显示 |
|------|------|
| 成功 | 绿色 toast "连接成功 - {模型名}" |
| 401 | 红色 toast "API Key 无效" |
| 其他 | 红色 toast + 具体错误信息 |

### 对话历史限制

保留现有逻辑：发送时只带最近 20 条历史消息，防止 token 溢出。

## 9. PWA 配置

使用 `vite-plugin-pwa` 自动生成 service worker 和 manifest：

```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Agent Ask',
    short_name: 'AgentAsk',
    description: 'AI 需求澄清助手 - 自带 Key，隐私优先',
    theme_color: '#0d0e10',
    icons: [
      { src: '/Agent_ask_icon.png', sizes: '192x192' },
      { src: '/Agent_ask_icon.png', sizes: '512x512' }
    ]
  }
})
```

### 部署选项

| 平台 | URL 形式 | 配置 |
|------|---------|------|
| GitHub Pages | `https://golden-forest.github.io/Agent_Ask/` | `base: '/Agent_Ask/'` |
| Vercel | `https://agent-ask.vercel.app/` | 零配置 |
| Cloudflare Pages | `https://agent-ask.pages.dev/` | 零配置 |

用户直接打开 URL，填自己的 Key 即可使用。浏览器可"添加到主屏幕"作为 App。

## 10. 不在本次范围内

以下项目明确排除，留待后续：

- Tauri 桌面 App 打包（下一阶段）
- 对话历史持久化（localStorage/IndexedDB）
- 多会话管理 / 导出
- 网络搜索功能（已去掉）
- 用户认证 / 多用户
- 国际化（i18n）
- 暗色/亮色主题切换
