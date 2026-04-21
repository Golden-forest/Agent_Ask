# 文件上传功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 agent_ask 聊天输入框中添加文档上传功能，支持 PDF/DOCX/TXT/MD 等格式，前端提取文本后作为上下文发给 DeepSeek。

**Architecture:** 前端通过 `fileParser.ts` 服务解析文档提取文本，文件内容直接拼接到聊天消息文本中，通过现有 Socket.IO 通道发送。后端零改动。

**Tech Stack:** `pdfjs-dist`（PDF 解析）、`mammoth`（DOCX 解析）、原生 FileReader（纯文本）

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `frontend/src/services/fileParser.ts` | 新建 | 各格式文档的文本提取 |
| `frontend/src/types/index.ts` | 修改 | 新增 `AttachedFile` 类型 |
| `frontend/src/store/chatStore.ts` | 修改 | 新增 `attachedFiles` 状态及方法，修改 `sendMessage` |
| `frontend/src/components/chat/ChatInput.tsx` | 修改 | 新增 "+" 按钮、拖拽上传、文件预览条 |
| `frontend/src/components/chat/MessageItem.tsx` | 修改 | 用户消息中展示附件标签 |
| `frontend/package.json` | 修改 | 新增 `pdfjs-dist`、`mammoth` 依赖 |

---

### Task 1: 安装依赖

- [ ] **Step 1: 安装 pdfjs-dist 和 mammoth**

```bash
cd /Users/hl/Projects/Agent/agent_ask/frontend && npm install pdfjs-dist mammoth
```

Expected: `added xxx packages`

- [ ] **Step 2: 验证安装成功**

```bash
cd /Users/hl/Projects/Agent/agent_ask/frontend && ls node_modules/pdfjs-dist/package.json node_modules/mammoth/package.json
```

Expected: 两个 package.json 文件均存在

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add pdfjs-dist and mammoth dependencies for file upload"
```

---

### Task 2: 新增 AttachedFile 类型定义

**Files:**
- Modify: `frontend/src/types/index.ts`

- [ ] **Step 1: 在 types/index.ts 末尾新增 AttachedFile 接口**

在文件末尾（第 35 行后）追加：

```typescript
export interface AttachedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    content: string;
    status: 'pending' | 'parsing' | 'ready' | 'error';
    error?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: add AttachedFile type definition"
```

---

### Task 3: 创建文件解析服务

**Files:**
- Create: `frontend/src/services/fileParser.ts`

- [ ] **Step 1: 创建 fileParser.ts**

```typescript
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 50000;

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.json', '.csv', '.pdf', '.docx', '.doc'];

function getFileExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

async function readAsText(file: File): Promise<string> {
    return file.text();
}

async function parsePDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
        textParts.push(pageText);
    }

    return textParts.join('\n');
}

async function parseDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

export function isSupportedFile(filename: string): boolean {
    const ext = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.includes(ext);
}

export function isFileSizeValid(size: number): boolean {
    return size <= MAX_FILE_SIZE;
}

export async function extractText(file: File): Promise<string> {
    if (!isFileSizeValid(file.size)) {
        throw new Error(`File too large (${formatSize(file.size)}). Maximum size is 5MB.`);
    }

    const ext = getFileExtension(file.name);

    let text: string;
    switch (ext) {
        case '.txt':
        case '.md':
        case '.json':
        case '.csv':
            text = await readAsText(file);
            break;
        case '.pdf':
            text = await parsePDF(file);
            break;
        case '.docx':
        case '.doc':
            text = await parseDocx(file);
            break;
        default:
            throw new Error(`Unsupported file type: ${ext}`);
    }

    if (text.length > MAX_TEXT_LENGTH) {
        text = text.slice(0, MAX_TEXT_LENGTH) + '\n\n[... content truncated]';
    }

    if (!text.trim()) {
        throw new Error('Could not extract any text from the file.');
    }

    return text;
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/services/fileParser.ts
git commit -m "feat: add fileParser service for document text extraction"
```

---

### Task 4: 修改 Zustand Store，添加文件管理

**Files:**
- Modify: `frontend/src/store/chatStore.ts`

- [ ] **Step 1: 在 chatStore.ts 中添加 import**

在文件顶部第 3 行后（`import { socketService }` 之后）新增：

```typescript
import type { AttachedFile } from '../types';
import { extractText } from '../services/fileParser';
```

- [ ] **Step 2: 在 ChatStore interface 中（第 5-30 行区域）新增状态和方法**

在 `showTerminalLog: boolean;`（第 14 行）后追加：

```typescript
    attachedFiles: AttachedFile[];
    addFile: (file: File) => Promise<void>;
    removeFile: (fileId: string) => void;
    clearFiles: () => void;
```

- [ ] **Step 3: 在 create 初始值中（第 47 行 `showTerminalLog: true,` 后）追加**

```typescript
    attachedFiles: [],
```

- [ ] **Step 4: 在 `clearSelectedOptions` 方法（第 310 行）后新增三个方法**

```typescript
    addFile: async (file: File) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Add file in pending state
        set((state) => ({
            attachedFiles: [...state.attachedFiles, {
                id,
                name: file.name,
                size: file.size,
                type: file.type,
                content: '',
                status: 'pending',
            }]
        }));

        try {
            // Update to parsing
            set((state) => ({
                attachedFiles: state.attachedFiles.map(f =>
                    f.id === id ? { ...f, status: 'parsing' as const } : f
                )
            }));

            const content = await extractText(file);

            // Update to ready
            set((state) => ({
                attachedFiles: state.attachedFiles.map(f =>
                    f.id === id ? { ...f, content, status: 'ready' as const } : f
                )
            }));
        } catch (err: any) {
            // Update to error
            set((state) => ({
                attachedFiles: state.attachedFiles.map(f =>
                    f.id === id ? { ...f, status: 'error' as const, error: err.message } : f
                )
            }));
        }
    },

    removeFile: (fileId: string) => {
        set((state) => ({
            attachedFiles: state.attachedFiles.filter(f => f.id !== fileId)
        }));
    },

    clearFiles: () => set({ attachedFiles: [] }),
```

- [ ] **Step 5: 修改 sendMessage 方法，在发送时拼接文件内容**

将第 238 行的 `sendMessage` 方法签名和内容修改为：

```typescript
    sendMessage: async (content) => {
        const { addMessage, setLoading, messages, currentConversationId, initSocket, selectedOptions, clearSelectedOptions, addSystemStatus, setPhase, attachedFiles, clearFiles } = get();
        if (!content.trim() && selectedOptions.length === 0 && attachedFiles.length === 0) return;

        // Ensure socket is connected
        initSocket();

        // Reset states when sending new message
        set({ isSearching: false });

        // Build file content section
        let fileSection = '';
        const readyFiles = attachedFiles.filter(f => f.status === 'ready');
        if (readyFiles.length > 0) {
            const fileBlocks = readyFiles.map(f =>
                `--- 附件: ${f.name} ---\n${f.content}`
            );
            fileSection = '\n\n' + fileBlocks.join('\n\n');
        }

        // Build full message with selected options and file content
        let fullMessage = content;
        if (selectedOptions.length > 0) {
            fullMessage += `\n\nSelected options: ${selectedOptions.join('; ')}`;
        }
        fullMessage += fileSection;

        // Add sending status
        addSystemStatus({
            phase: 'sending',
            message: '[>] Transmitting payload...',
            details: `${fullMessage.length} bytes`,
        });
        setPhase('sending');

        // Add user message (display original text without file content)
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: fullMessage,
            timestamp: new Date(),
        };
        addMessage(userMsg);
        set({ input: '' });
        setLoading(true);

        // Emit to socket
        socketService.emit('chat_message', {
            message: fullMessage,
            history: messages.map(m => ({
                role: m.role,
                content: m.content,
                id: m.id,
                timestamp: m.timestamp
            })),
            conversation_id: currentConversationId || undefined
        });

        // Add sent status
        addSystemStatus({
            phase: 'complete',
            message: '[✓] Sent successfully',
        });

        // Clear selected options and files after sending
        clearSelectedOptions();
        clearFiles();
    },
```

- [ ] **Step 6: 修改 newConversation 方法，清除 attachedFiles**

在第 60-74 行的 `newConversation` 中，在 `isSearching: false` 后追加 `attachedFiles: [],`。完整方法：

```typescript
    newConversation: () => set({
        messages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Hello! I am agent_ask. Please tell me your requirements, and I will help you clarify the details.',
                timestamp: new Date(),
            }
        ],
        currentConversationId: null,
        selectedOptions: [],
        input: '',
        isLoading: false,
        isSearching: false,
        attachedFiles: [],
    }),
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/store/chatStore.ts
git commit -m "feat: add file attachment management to chatStore"
```

---

### Task 5: 修改 ChatInput 组件，添加上传 UI

**Files:**
- Modify: `frontend/src/components/chat/ChatInput.tsx`

- [ ] **Step 1: 重写 ChatInput.tsx**

用以下内容完整替换文件：

```typescript
import React, { useRef, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Send, X, Plus } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { isSupportedFile, formatSize } from '../../services/fileParser';
import toast from 'react-hot-toast';

const ACCEPTED_EXTENSIONS = '.txt,.md,.json,.csv,.pdf,.docx,.doc';

export const ChatInput: React.FC = () => {
    const { input, setInput, sendMessage, isLoading, selectedOptions, toggleOption, attachedFiles, addFile, removeFile } = useChatStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);

    const canSend = (input.trim() || selectedOptions.length > 0 || attachedFiles.some(f => f.status === 'ready')) && !isLoading;

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (canSend) {
            sendMessage(input);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
    };

    const processFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);

        for (const file of fileArray) {
            if (!isSupportedFile(file.name)) {
                toast.error(`Unsupported file type: ${file.name}`);
                continue;
            }
            if (attachedFiles.length >= 3) {
                toast.error('Maximum 3 files allowed');
                break;
            }
            await addFile(file);
        }
    }, [attachedFiles.length, addFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Selected options display */}
            {selectedOptions.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {selectedOptions.map((option: string, index: number) => (
                        <div
                            key={index}
                            className="px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs flex items-center gap-1.5 animate-fade-in"
                        >
                            <span>{option}</span>
                            <button
                                onClick={() => toggleOption(option)}
                                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {attachedFiles.map((file) => (
                        <div
                            key={file.id}
                            className="px-2.5 py-1.5 bg-surface/80 border border-border/50 rounded-lg text-xs flex items-center gap-1.5 animate-fade-in"
                        >
                            {file.status === 'pending' && (
                                <span className="text-textSecondary">Loading {file.name}...</span>
                            )}
                            {file.status === 'parsing' && (
                                <span className="text-yellow-500">Parsing {file.name}...</span>
                            )}
                            {file.status === 'ready' && (
                                <span className="text-green-500">[{formatSize(file.size)}] {file.name}</span>
                            )}
                            {file.status === 'error' && (
                                <span className="text-red-500" title={file.error}>{file.name}: {file.error}</span>
                            )}
                            <button
                                onClick={() => removeFile(file.id)}
                                className="hover:bg-surfaceHover rounded-full p-0.5 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit}
                className={`relative flex items-end gap-2 bg-surface/80 backdrop-blur-md border rounded-2xl p-1.5 shadow-lg shadow-black/20 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200 ${isDragOver ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your requirements, attach files, or select options above..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full bg-transparent text-text placeholder-textSecondary border-none focus:ring-0 resize-none py-2.5 px-3 max-h-[150px] custom-scrollbar text-sm"
                    style={{ minHeight: '44px' }}
                />
                <div className="flex gap-1.5 mb-0.5 mr-0.5">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="h-9 w-9 p-0 rounded-xl flex items-center justify-center transition-all shrink-0 bg-surfaceHover text-textSecondary hover:text-text hover:bg-surface border border-border/50"
                        title="Attach file"
                    >
                        <Plus className="w-4 h-4 shrink-0" />
                    </button>
                    <Button
                        type="button"
                        onClick={() => sendMessage('Accept')}
                        disabled={isLoading}
                        className="h-9 px-3 rounded-xl flex items-center justify-center bg-green-600/10 text-green-500 hover:bg-green-600/20 border border-green-600/30 transition-all text-sm font-medium"
                        title="Accept & Generate Prompt"
                    >
                        Accept
                    </Button>
                    <Button
                        type="submit"
                        disabled={!canSend}
                        className={`
                            h-9 w-9 p-0 rounded-xl flex items-center justify-center transition-all shrink-0
                            ${canSend ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surfaceHover text-textSecondary'}
                        `}
                        variant={canSend ? 'primary' : 'ghost'}
                    >
                        <Send className="w-4 h-4 shrink-0" />
                    </Button>
                </div>
            </form>
            <div className="text-center mt-2 text-xs text-textSecondary">
                Press Enter to send, Shift + Enter for new line. Supports TXT, MD, PDF, DOCX.
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/chat/ChatInput.tsx
git commit -m "feat: add file upload button and drag-drop to ChatInput"
```

---

### Task 6: 修改 MessageItem，展示附件标签

**Files:**
- Modify: `frontend/src/components/chat/MessageItem.tsx`

- [ ] **Step 1: 在 MessageItem 组件中添加附件解析逻辑和展示**

在第 64 行 `export const MessageItem` 之前，添加一个新函数：

```typescript
// Parse attachments from user message content
function parseAttachments(content: string): { mainText: string; attachments: string[] } {
    const attachmentRegex = /---\s*附件:\s*([^\n]+)\s*---\n([\s\S]*?)(?=\n---\s*附件:|$)/g;
    const attachments: string[] = [];
    let mainText = content;

    const matches = [...content.matchAll(attachmentRegex)];
    if (matches.length > 0) {
        attachments = matches.map(m => m[1].trim());
        mainText = content.replace(attachmentRegex, '').trim();
    }

    return { mainText, attachments };
}
```

- [ ] **Step 2: 修改 MessageItem 组件中的渲染逻辑**

在第 69 行的 `useMemo` 中，修改用户消息分支。将整个 `useMemo` 替换为：

```typescript
    const { mainText, options, attachments } = useMemo(() => {
        if (isUser) {
            const { mainText: text, attachments: att } = parseAttachments(message.content);
            return { mainText: text, options: [], attachments: att };
        }
        if (!message.isStreaming) {
            let cleanContent = message.content;
            const optionsInlineRegex = /\*\*Option\s*\d+:\s*[^*]+\*\*[ \t]*:[ \t]*[^\n]*(\n(?!\*\*Option\s*\d+:)|$)/gi;
            const optionsBlockRegex = /```[\s\S]*?\*\*(?:Strategic )?Options\*\*[\s\S]*?```/i;
            const optionsListRegex = /\*\*(?:Strategic )?Options\*\*:\s*((?:- .+\n?)+)/i;

            if (optionsInlineRegex.test(cleanContent)) {
                cleanContent = cleanContent.replace(optionsInlineRegex, '').trim();
            } else if (optionsBlockRegex.test(cleanContent)) {
                cleanContent = cleanContent.replace(optionsBlockRegex, '').trim();
            } else if (optionsListRegex.test(cleanContent)) {
                cleanContent = cleanContent.replace(optionsListRegex, '').trim();
            }

            return {
                mainText: cleanContent,
                options: parseOptions(message.content).options,
                attachments: [],
            };
        }
        return { mainText: message.content, options: [], attachments: [] };
    }, [message.content, isUser, message.isStreaming]);
```

- [ ] **Step 3: 在用户消息渲染区域中添加附件标签展示**

将第 148-149 行：

```typescript
                    {isUser ? (
                        <p className="whitespace-pre-wrap m-0 leading-relaxed">{message.content}</p>
```

替换为：

```typescript
                    {isUser ? (
                        <div className="whitespace-pre-wrap m-0 leading-relaxed">
                            <p>{mainText}</p>
                            {attachments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {attachments.map((name, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface/50 border border-border/50 rounded text-xs text-textSecondary">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
```

- [ ] **Step 4: 修改 useMemo 依赖数组**

在步骤 2 的 useMemo 代码中，依赖数组已经是 `[message.content, isUser, message.isStreaming]`，无需额外修改。`attachments` 从 `message.content` 派生，不引入新依赖。

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/chat/MessageItem.tsx
git commit -m "feat: display attachment tags in user messages"
```

---

### Task 7: 端到端验证

- [ ] **Step 1: 启动开发服务器确认无编译错误**

```bash
cd /Users/hl/Projects/Agent/agent_ask/frontend && npm run build
```

Expected: 编译成功，无 TypeScript 错误

- [ ] **Step 2: 在浏览器中手动验证**

1. 打开 http://localhost:5173
2. 点击输入框旁的 "+" 按钮，选择一个 .txt 文件，确认预览条显示绿色 "ready" 状态
3. 输入文字并发送，确认消息中附件标签正确展示
4. 拖拽一个 .pdf 文件到输入区域，确认文件被解析
5. 发送带附件的消息，确认 DeepSeek 收到并理解文档内容
6. 测试错误场景：选择一个不支持的 .exe 文件，确认错误提示
7. 测试超过 3 个文件，确认提示 "Maximum 3 files allowed"

- [ ] **Step 3: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete file upload feature - attach documents to chat messages"
```
