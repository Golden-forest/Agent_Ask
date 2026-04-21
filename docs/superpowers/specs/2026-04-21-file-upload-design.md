# 文件上传功能设计

## 概述

为 agent_ask 添加文档上传功能，用户可在聊天中附加文档文件，系统提取文本内容后作为上下文发送给 DeepSeek AI，帮助 AI 更好地理解用户需求。

## 设计决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 上传方式 | 前端提取文本 + Socket.IO 传输 | 最小化改动，后端零修改 |
| 文件类型 | 文本/文档（txt/md/json/csv/pdf/docx） | 用户明确不需要图片 |
| 交互方式 | "+" 按钮 + 拖拽上传 | 用户要求两者都支持 |
| 文件内容传递 | 拼接到消息文本中 | 复用现有 Socket.IO 协议，后端零改动 |
| AI 模型 | 继续用 DeepSeek Chat | 纯文本输入，无需视觉模型 |

## 改动范围

### 新增文件

| 文件 | 说明 |
|------|------|
| `frontend/src/services/fileParser.ts` | 文档解析服务，封装各格式文本提取 |

### 修改文件

| 文件 | 改动说明 |
|------|----------|
| `frontend/package.json` | 新增 `pdfjs-dist`、`mammoth` 依赖 |
| `frontend/src/components/chat/ChatInput.tsx` | 新增 "+" 按钮、拖拽、文件预览条 |
| `frontend/src/components/chat/MessageItem.tsx` | 用户消息中展示文件标签 |
| `frontend/src/store/chatStore.ts` | 新增 `attachedFiles` 状态、文件解析逻辑 |
| `frontend/src/types/index.ts` | 新增 `AttachedFile` 类型 |

### 不改动

- `server.py` — 零改动
- Socket.IO 协议 — 零改动
- 数据库 — 零改动
- Prompt 构建 — 零改动

## 数据流

```
用户选择/拖拽文件
    ↓
fileParser.ts 提取文本（前端解析）
    ↓
ChatInput 显示文件预览（文件名 + 大小 + 删除按钮）
    ↓
用户点击发送
    ↓
chatStore.sendMessage() 将文件内容拼接到消息：
  "用户文本\n\n--- 附件: xxx.pdf ---\n{提取的文本内容}"
    ↓
Socket.IO chat_message 事件发送（message 字段包含文档内容）
    ↓
后端照常构建 prompt，DeepSeek 理解文档上下文
```

## 详细设计

### 1. 类型定义 (`types/index.ts`)

```typescript
interface AttachedFile {
  id: string;           // uuid
  name: string;         // 原始文件名，如 "requirements.pdf"
  size: number;         // 文件大小（字节）
  type: string;         // MIME 类型
  content: string;      // 提取的文本内容
  status: 'pending' | 'parsing' | 'ready' | 'error';
  error?: string;       // 解析错误信息
}
```

### 2. 文件解析服务 (`services/fileParser.ts`)

支持的格式及解析策略：

| 扩展名 | 解析方式 | 依赖库 |
|--------|----------|--------|
| `.txt` `.md` `.json` `.csv` | 原生 FileReader | 无 |
| `.pdf` | pdfjs-dist 提取文本 | `pdfjs-dist` |
| `.docx` `.doc` | mammoth 转 HTML 再提取文本 | `mammoth` |

限制：
- 文件大小上限：5MB
- 提取文本截断：50,000 字符
- 同时附加文件数：最多 3 个
- 解析失败：返回错误信息，不阻塞消息发送

### 3. ChatInput 改动

当前组件是 textarea + Accept/Send 按钮。改动点：

- textarea 左侧新增 `+` 按钮，点击触发隐藏的 `<input type="file" accept=".txt,.md,.json,.csv,.pdf,.docx,.doc">`
- 整个输入区域支持 `onDragOver` / `onDrop` 事件，拖拽时显示高亮边框
- 文件上传后在 textarea 上方显示文件预览条：每个文件显示文件名、大小、解析状态、删除按钮
- 发送消息时遍历 `attachedFiles`，将所有 `ready` 状态文件的内容拼接到消息文本

消息拼接格式：
```
用户输入的文本

--- 附件: requirements.pdf ---
{提取的文档文本内容}
```

多个文件时：
```
用户输入的文本

--- 附件: requirements.pdf ---
{pdf 文本内容}

--- 附件: notes.md ---
{md 文本内容}
```

### 4. MessageItem 展示

用户消息中检测 `--- 附件:` 标记，将其渲染为小型文件标签（如 `[📄 requirements.pdf]`），从消息正文中剥离，不重复显示文件内容。

### 5. Zustand Store 改动 (`store/chatStore.ts`)

新增状态：

```typescript
attachedFiles: AttachedFile[]  // 当前附加的文件列表
```

新增方法：

```typescript
addFile(file: File): Promise<void>    // 添加文件并触发解析
removeFile(fileId: string): void       // 移除文件
clearFiles(): void                     // 发送后清空
```

修改 `sendMessage()` 方法：发送前将 `attachedFiles` 的内容拼接到消息文本，发送后调用 `clearFiles()`。
